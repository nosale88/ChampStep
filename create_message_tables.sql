-- 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  author_id UUID REFERENCES auth.users(id),
  target_type VARCHAR(20) CHECK (target_type IN ('dancer', 'crew')),
  target_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 메시지 읽음 상태 테이블
CREATE TABLE IF NOT EXISTS message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(message_id, user_id)
);

-- 인덱스 생성
CREATE INDEX idx_messages_target ON messages(target_type, target_id);
CREATE INDEX idx_messages_author ON messages(author_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_message_reads_user ON message_reads(user_id);

-- Row Level Security (RLS) 정책
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- 공개 메시지는 누구나 볼 수 있고, 비공개는 작성자와 대상만
CREATE POLICY "View messages" ON messages
  FOR SELECT USING (
    is_public = true OR 
    author_id = auth.uid() OR
    (target_type = 'dancer' AND target_id = (SELECT id FROM dancers WHERE user_id = auth.uid())) OR
    (target_type = 'crew' AND EXISTS (
      SELECT 1 FROM dancers 
      WHERE dancers.user_id = auth.uid() 
      AND dancers.crew = (SELECT name FROM crews WHERE crews.id::text = messages.target_id::text)
    ))
  );

-- 인증된 사용자만 메시지 작성 가능
CREATE POLICY "Create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자만 메시지 수정 가능
CREATE POLICY "Update messages" ON messages
  FOR UPDATE USING (author_id = auth.uid());

-- 작성자만 메시지 삭제 가능
CREATE POLICY "Delete messages" ON messages
  FOR DELETE USING (author_id = auth.uid());

-- 본인의 읽음 상태만 관리 가능
CREATE POLICY "Manage own read status" ON message_reads
  FOR ALL USING (user_id = auth.uid());

-- 메시지 생성시 작성자 ID 자동 설정
CREATE OR REPLACE FUNCTION set_message_author()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_id IS NULL THEN
    NEW.author_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_message_author_trigger
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION set_message_author(); 