import { supabase } from '../lib/supabase';

export type ImageType = 'avatar' | 'background' | 'profile' | 'crew' | 'competition';

const BUCKET_NAME = 'champstep-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 이미지 업로드
export async function uploadImage(
  file: File,
  type: ImageType,
  entityId: string
): Promise<string | null> {
  try {
    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('파일 크기는 5MB를 초과할 수 없습니다.');
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }

    // 파일명 생성 (타입_엔티티ID_타임스탬프.확장자)
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}/${entityId}/${Date.now()}.${fileExt}`;

    // 기존 파일 삭제 (avatar와 profile은 하나만 유지)
    if (type === 'avatar' || type === 'profile') {
      await deleteImages(type, entityId);
    }

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// 이미지 삭제
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// 특정 타입의 모든 이미지 삭제
export async function deleteImages(type: ImageType, entityId: string): Promise<boolean> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${type}/${entityId}`);

    if (listError) throw listError;

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${type}/${entityId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Error deleting images:', error);
    return false;
  }
}

// 이미지 압축 (클라이언트 사이드)
export async function compressImage(file: File, maxWidth: number = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 이미지 크기 조정
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('이미지 압축 실패'));
            }
          },
          'image/jpeg',
          0.8 // 품질 80%
        );
      };
    };
  });
}

// 댄서 프로필 이미지 업데이트
export async function updateDancerImage(
  dancerId: string,
  file: File,
  imageType: 'avatar' | 'background' | 'profile'
): Promise<string | null> {
  try {
    // 이미지 압축
    const compressedFile = await compressImage(file);
    
    // 이미지 업로드
    const imageUrl = await uploadImage(compressedFile, imageType, dancerId);
    
    if (!imageUrl) throw new Error('이미지 업로드 실패');

    // 데이터베이스 업데이트
    const updateData: any = {};
    if (imageType === 'avatar') updateData.avatar = imageUrl;
    else if (imageType === 'background') updateData.background_image = imageUrl;
    else if (imageType === 'profile') updateData.profile_image = imageUrl;

    const { error } = await supabase
      .from('dancers')
      .update(updateData)
      .eq('id', dancerId);

    if (error) throw error;

    return imageUrl;
  } catch (error) {
    console.error('Error updating dancer image:', error);
    return null;
  }
}

// 크루 이미지 업데이트
export async function updateCrewImage(
  crewId: string,
  file: File,
  imageType: 'avatar' | 'background'
): Promise<string | null> {
  try {
    // 이미지 압축
    const compressedFile = await compressImage(file);
    
    // 이미지 업로드
    const imageUrl = await uploadImage(compressedFile, 'crew', crewId);
    
    if (!imageUrl) throw new Error('이미지 업로드 실패');

    // 데이터베이스 업데이트 (crews 테이블에 background_image 컬럼이 없으므로 스토리지 URL만 반환)
    console.log('🔄 크루 이미지 업로드 완료, DB 업데이트 스킵 (컬럼 없음):', {
      crewId,
      imageType,
      imageUrl
    });
    
    // TODO: crews 테이블에 background_image, avatar 컬럼 추가 필요
    // const updateData: any = {};
    // if (imageType === 'avatar') updateData.avatar = imageUrl;
    // else if (imageType === 'background') updateData.background_image = imageUrl;

    // const { error } = await supabase
    //   .from('crews')
    //   .update(updateData)
    //   .eq('id', crewId);

    // if (error) throw error;

    return imageUrl;
  } catch (error) {
    console.error('Error updating crew image:', error);
    return null;
  }
}

// 대회 포스터 업로드
export async function uploadCompetitionPoster(
  competitionId: string,
  file: File
): Promise<string | null> {
  try {
    // 이미지 압축
    const compressedFile = await compressImage(file, 1600);
    
    // 이미지 업로드
    const imageUrl = await uploadImage(compressedFile, 'competition', competitionId);
    
    if (!imageUrl) throw new Error('이미지 업로드 실패');

    // 데이터베이스 업데이트
    const { error } = await supabase
      .from('competitions')
      .update({ poster: imageUrl })
      .eq('id', competitionId);

    if (error) throw error;

    return imageUrl;
  } catch (error) {
    console.error('Error uploading competition poster:', error);
    return null;
  }
} 