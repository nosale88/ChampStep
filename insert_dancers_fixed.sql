-- 올바른 스키마로 댄서 데이터 삽입
-- Supabase SQL Editor에서 실행하세요

-- 먼저 기존 데이터 삭제 (필요시)
-- DELETE FROM dancers;

-- 댄서 데이터 삽입 (실제 스키마에 맞춤)
INSERT INTO dancers (
    id, nickname, name, crew, genres, sns, total_points, rank, avatar, 
    email, phone, bio, created_at, updated_at
) VALUES
-- 상위 20명
('d1', 'J-ROC', '김주락', 'JINJO CREW', ARRAY['B-boying', 'Popping'], 'https://www.instagram.com/jroc_official/', 1200, 1, 'https://i.pravatar.cc/150?u=d1', 'jroc@example.com', '010-1234-0001', 'World champion B-boy from JINJO CREW', NOW(), NOW()),
('d2', 'Waack-T', '박태리', 'WAACKING QUEENS', ARRAY['Waacking'], 'https://www.instagram.com/waackt/', 1150, 2, 'https://i.pravatar.cc/150?u=d2', 'waackt@example.com', '010-1234-0002', 'Leading waacking dancer in Korea', NOW(), NOW()),
('d3', 'Lia Kim', '김리아', '1MILLION DANCE STUDIO', ARRAY['Choreography', 'Hip-hop'], 'https://www.instagram.com/liakimhappy/', 1000, 3, 'https://i.pravatar.cc/150?u=d3', 'liakim@example.com', '010-1234-0003', 'World-renowned choreographer and dancer', NOW(), NOW()),
('d4', 'WQ', 'WaackQueen', 'WAACKING QUEENS', ARRAY['Waacking'], 'https://www.instagram.com/waackqueen/', 950, 4, 'https://i.pravatar.cc/150?u=d4', 'wq@example.com', '010-1234-0004', 'Professional waacking instructor', NOW(), NOW()),
('d5', 'Phoenix', 'B-Boy Phoenix', 'JINJO CREW', ARRAY['B-boying'], 'https://www.instagram.com/phoenix_bboy/', 900, 5, 'https://i.pravatar.cc/150?u=d5', 'phoenix@example.com', '010-1234-0005', 'Power move specialist', NOW(), NOW()),
('d6', 'Empress', 'Vogue Empress', 'VOGUE FEVER', ARRAY['Waacking', 'Voguing'], 'https://www.instagram.com/vogue_empress/', 850, 6, 'https://i.pravatar.cc/150?u=d6', 'empress@example.com', '010-1234-0006', 'Ballroom culture ambassador', NOW(), NOW()),
('d7', 'Hype', 'Hype Man', 'HIPHOP UNITY', ARRAY['Hip-hop'], 'https://www.instagram.com/hype_man_official/', 800, 7, 'https://i.pravatar.cc/150?u=d7', 'hype@example.com', '010-1234-0007', 'Old school hip-hop dancer', NOW(), NOW()),
('d8', 'Prince', 'Popping Prince', 'POPPING LEGENDS', ARRAY['Popping', 'Hip-hop'], 'https://www.instagram.com/popping_prince/', 750, 8, 'https://i.pravatar.cc/150?u=d8', 'prince@example.com', '010-1234-0008', 'Funk and popping master', NOW(), NOW()),
('d9', 'LOCKING-KHAN', '김기현', 'LOCK N LOL', ARRAY['Locking'], 'https://www.instagram.com/locking_khan/', 700, 9, 'https://i.pravatar.cc/150?u=d9', 'khan@example.com', '010-1234-0009', 'Original locking dancer', NOW(), NOW()),
('d10', 'JINI', '최진희', 'HOUSE NATION', ARRAY['House'], 'https://www.instagram.com/jini_house/', 680, 10, 'https://i.pravatar.cc/150?u=d10', 'jini@example.com', '010-1234-0010', 'House dance specialist', NOW(), NOW()),
('d11', 'GO', '고준영', 'JINJO CREW', ARRAY['B-boying'], 'https://www.instagram.com/go_bboy/', 660, 11, 'https://i.pravatar.cc/150?u=d11', 'go@example.com', '010-1234-0011', 'Style and flow focused B-boy', NOW(), NOW()),
('d12', 'GISELLE', '지젤', 'WAACKING QUEENS', ARRAY['Waacking'], 'https://www.instagram.com/giselle_waack/', 640, 12, 'https://i.pravatar.cc/150?u=d12', 'giselle@example.com', '010-1234-0012', 'Waacking performance artist', NOW(), NOW()),
('d13', 'HOZIN', '호진', 'POPPING LEGENDS', ARRAY['Popping'], 'https://www.instagram.com/hozin_popping/', 620, 13, 'https://i.pravatar.cc/150?u=d13', 'hozin@example.com', '010-1234-0013', 'Animation and popping expert', NOW(), NOW()),
('d14', 'LIP J', '조효원', 'WAACKING QUEENS', ARRAY['Waacking', 'Choreography'], 'https://www.instagram.com/lipjmolip/', 600, 14, 'https://i.pravatar.cc/150?u=d14', 'lipj@example.com', '010-1234-0014', 'Waacking choreographer', NOW(), NOW()),
('d15', 'Zooty zoot', '박민혁', NULL, ARRAY['B-boying'], 'https://www.instagram.com/zootyseoul', 580, 15, 'https://i.pravatar.cc/150?u=d15', 'zooty@example.com', '010-1234-0015', 'Freestyle B-boy', NOW(), NOW()),
('d16', 'Jin', '진', NULL, ARRAY['Popping'], 'https://www.instagram.com/jin_funkintheheart/', 560, 16, 'https://i.pravatar.cc/150?u=d16', 'jin@example.com', '010-1234-0016', 'Funk in the heart', NOW(), NOW()),
('d17', 'JEEM', '짐', NULL, ARRAY['Waacking'], 'https://www.instagram.com/masterpiece_jeem/', 540, 17, 'https://i.pravatar.cc/150?u=d17', 'jeem@example.com', '010-1234-0017', 'Masterpiece waacking', NOW(), NOW()),
('d18', 'Konan', '김영진', NULL, ARRAY['B-boying'], 'https://www.instagram.com/kim.konan/', 520, 18, 'https://i.pravatar.cc/150?u=d18', 'konan@example.com', '010-1234-0018', 'B-boy Konan', NOW(), NOW()),
('d19', 'JEMIN', '장제민', NULL, ARRAY['Waacking'], 'https://www.instagram.com/jeminofficial/', 500, 19, 'https://i.pravatar.cc/150?u=d19', 'jemin@example.com', '010-1234-0019', 'Professional waacking dancer', NOW(), NOW()),
('d20', 'Madman', '박우송', NULL, ARRAY['B-boying'], 'https://www.instagram.com/madman_park/', 480, 20, 'https://i.pravatar.cc/150?u=d20', 'madman@example.com', '010-1234-0020', 'Madman style B-boy', NOW(), NOW()),

-- 추가 댄서들 (21-30명)
('d21', 'Brother bin', '박형빈', NULL, ARRAY['Locking'], 'https://www.instagram.com/brother_bin/', 460, 21, 'https://i.pravatar.cc/150?u=d21', 'bin@example.com', '010-1234-0021', 'Locking specialist', NOW(), NOW()),
('d22', 'C.Know', '강신호', NULL, ARRAY['Waacking'], 'https://www.instagram.com/c.know_k/', 440, 22, 'https://i.pravatar.cc/150?u=d22', 'cknow@example.com', '010-1234-0022', 'Waacking knowledge', NOW(), NOW()),
('d23', '5000', '신승훈', NULL, ARRAY['Hip-hop'], 'https://www.instagram.com/5000rpsn.kr/', 420, 23, 'https://i.pravatar.cc/150?u=d23', '5000@example.com', '010-1234-0023', 'Hip-hop 5000', NOW(), NOW()),
('d24', 'B1', '엄혜성', NULL, ARRAY['B-boying'], 'https://www.instagram.com/yuseonyeong8474', 400, 24, 'https://i.pravatar.cc/150?u=d24', 'b1@example.com', '010-1234-0024', 'B-boy B1', NOW(), NOW()),
('d25', 'Rush', '최동욱', NULL, ARRAY['B-boying'], 'https://www.instagram.com/bboyrush88', 380, 25, 'https://i.pravatar.cc/150?u=d25', 'rush@example.com', '010-1234-0025', 'B-boy Rush', NOW(), NOW()),
('d26', 'Melman', '멜먼', NULL, ARRAY['Popping'], 'https://www.instagram.com/melman_justevee/', 360, 26, 'https://i.pravatar.cc/150?u=d26', 'melman@example.com', '010-1234-0026', 'Popping Melman', NOW(), NOW()),
('d27', 'Dandy', '댄디', NULL, ARRAY['Popping'], 'https://www.instagram.com/dandy_popping/', 340, 27, 'https://i.pravatar.cc/150?u=d27', 'dandy@example.com', '010-1234-0027', 'Dandy popping', NOW(), NOW()),
('d28', 'Troydi', '트로이디', NULL, ARRAY['House'], 'https://www.instagram.com/troydi_house/', 320, 28, 'https://i.pravatar.cc/150?u=d28', 'troydi@example.com', '010-1234-0028', 'House dancer Troydi', NOW(), NOW()),
('d29', 'ONEBell', '원벨', NULL, ARRAY['Hip-hop'], 'https://www.instagram.com/onebell_hiphop/', 300, 29, 'https://i.pravatar.cc/150?u=d29', 'onebell@example.com', '010-1234-0029', 'Hip-hop ONEBell', NOW(), NOW()),
('d30', 'Rhythmgate', '리듬게이트', NULL, ARRAY['Hip-hop'], 'https://www.instagram.com/rhythmgate/', 280, 30, 'https://i.pravatar.cc/150?u=d30', 'rhythmgate@example.com', '010-1234-0030', 'Rhythmgate hip-hop', NOW(), NOW());

-- 크루 데이터 삽입
INSERT INTO crews (id, name, description, founded_year, location, member_count, created_at) VALUES
('crew1', 'JINJO CREW', 'World famous B-boy crew from Korea', 2001, 'Seoul', 8, NOW()),
('crew2', 'WAACKING QUEENS', 'Leading waacking crew in Korea', 2015, 'Seoul', 6, NOW()),
('crew3', '1MILLION DANCE STUDIO', 'Global choreography powerhouse', 2014, 'Seoul', 12, NOW()),
('crew4', 'VOGUE FEVER', 'Ballroom and vogue culture crew', 2018, 'Seoul', 5, NOW()),
('crew5', 'HIPHOP UNITY', 'Old school hip-hop preservation crew', 2010, 'Busan', 7, NOW()),
('crew6', 'POPPING LEGENDS', 'Funk and popping specialists', 2012, 'Seoul', 9, NOW()),
('crew7', 'LOCK N LOL', 'Locking dance crew', 2016, 'Daegu', 4, NOW()),
('crew8', 'HOUSE NATION', 'House dance community', 2019, 'Seoul', 6, NOW()),
('crew9', 'CHOREOGRAPHY COLLECTIVE', 'Modern choreography group', 2020, 'Seoul', 8, NOW());

-- 대회 데이터 삽입 (간단한 버전)
INSERT INTO competitions (
    id, name, event_name, manager_name, manager_email, genres, venue, 
    event_start_date, prize_details, description, created_at
) VALUES
('comp1', 'Groove Seoul 2024', 'Groove Seoul 2024', 'Kim Manager', 'manager@grooveseoul.com', 
 ARRAY['B-boying', 'Waacking', 'Popping', 'Hip-hop'], 'Olympic Park, Seoul', 
 '2024-08-15', '1등 3000만원, 2등 1500만원, 3등 500만원', 
 'Korea''s biggest street dance battle', NOW()),
('comp2', 'B-Boy Championship', 'International Breaking Battle', 'Park Organizer', 'org@bboy.com',
 ARRAY['B-boying'], 'KINTEX, Goyang',
 '2024-09-20', '1등 2000만원, 2등 1000만원, 3등 300만원',
 'International breaking competition', NOW()),
('comp3', 'Waacking Festival', 'Seoul Waacking Festival', 'Lee Producer', 'producer@waacking.kr',
 ARRAY['Waacking'], 'Hongdae, Seoul',
 '2024-12-01', '1등 1500만원, 2등 800만원, 3등 200만원',
 'Waacking dance celebration', NOW());

-- 확인 쿼리
SELECT COUNT(*) as dancer_count FROM dancers;
SELECT COUNT(*) as crew_count FROM crews;
SELECT COUNT(*) as competition_count FROM competitions;