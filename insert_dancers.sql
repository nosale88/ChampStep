-- 댄서 데이터 삽입 SQL
-- Supabase SQL Editor에서 실행하세요

-- 기본 댄서들 (상위 20명)
INSERT INTO dancers (id, nickname, name, genres, sns, total_points, rank, avatar, crew_ids) VALUES
('d1', 'J-ROC', '김주락', ARRAY['B-boying', 'Popping'], 'https://www.instagram.com/jroc_official/', 1200, 1, 'https://i.pravatar.cc/150?u=d1', ARRAY['crew1']),
('d2', 'Waack-T', '박태리', ARRAY['Waacking'], 'https://www.instagram.com/waackt/', 1150, 2, 'https://i.pravatar.cc/150?u=d2', ARRAY['crew2']),
('d3', 'Lia Kim', '김리아', ARRAY['Choreography', 'Hip-hop'], 'https://www.instagram.com/liakimhappy/', 1000, 3, 'https://i.pravatar.cc/150?u=d3', ARRAY['crew3']),
('d4', 'WQ', 'WaackQueen', ARRAY['Waacking'], 'https://www.instagram.com/waackqueen/', 950, 4, 'https://i.pravatar.cc/150?u=d4', ARRAY['crew2']),
('d5', 'Phoenix', 'B-Boy Phoenix', ARRAY['B-boying'], 'https://www.instagram.com/phoenix_bboy/', 900, 5, 'https://i.pravatar.cc/150?u=d5', ARRAY['crew1']),
('d6', 'Empress', 'Vogue Empress', ARRAY['Waacking', 'Voguing'], 'https://www.instagram.com/vogue_empress/', 850, 6, 'https://i.pravatar.cc/150?u=d6', ARRAY['crew4']),
('d7', 'Hype', 'Hype Man', ARRAY['Hip-hop'], 'https://www.instagram.com/hype_man_official/', 800, 7, 'https://i.pravatar.cc/150?u=d7', ARRAY['crew5']),
('d8', 'Prince', 'Popping Prince', ARRAY['Popping', 'Hip-hop'], 'https://www.instagram.com/popping_prince/', 750, 8, 'https://i.pravatar.cc/150?u=d8', ARRAY['crew6']),
('d9', 'LOCKING-KHAN', '김기현', ARRAY['Locking'], 'https://www.instagram.com/locking_khan/', 700, 9, 'https://i.pravatar.cc/150?u=d9', ARRAY['crew7']),
('d10', 'JINI', '최진희', ARRAY['House'], 'https://www.instagram.com/jini_house/', 680, 10, 'https://i.pravatar.cc/150?u=d10', ARRAY['crew8']),
('d11', 'GO', '고준영', ARRAY['B-boying'], 'https://www.instagram.com/go_bboy/', 660, 11, 'https://i.pravatar.cc/150?u=d11', ARRAY['crew1']),
('d12', 'GISELLE', '지젤', ARRAY['Waacking'], 'https://www.instagram.com/giselle_waack/', 640, 12, 'https://i.pravatar.cc/150?u=d12', ARRAY['crew2']),
('d13', 'HOZIN', '호진', ARRAY['Popping'], 'https://www.instagram.com/hozin_popping/', 620, 13, 'https://i.pravatar.cc/150?u=d13', ARRAY['crew6']),
('d14', 'LIP J', '조효원', ARRAY['Waacking', 'Choreography'], 'https://www.instagram.com/lipjmolip/', 600, 14, 'https://i.pravatar.cc/150?u=d14', ARRAY['crew2', 'crew9']),
('d15', 'Zooty zoot', '박민혁', ARRAY['B-boying'], 'https://www.instagram.com/zootyseoul', 580, 15, 'https://i.pravatar.cc/150?u=d15', ARRAY[]),
('d16', 'Jin', '진', ARRAY['Popping'], 'https://www.instagram.com/jin_funkintheheart/', 560, 16, 'https://i.pravatar.cc/150?u=d16', ARRAY[]),
('d17', 'JEEM', '짐', ARRAY['Waacking'], 'https://www.instagram.com/masterpiece_jeem/', 540, 17, 'https://i.pravatar.cc/150?u=d17', ARRAY[]),
('d18', 'Konan', '김영진', ARRAY['B-boying'], 'https://www.instagram.com/kim.konan/', 520, 18, 'https://i.pravatar.cc/150?u=d18', ARRAY[]),
('d19', 'JEMIN', '장제민', ARRAY['Waacking'], 'https://www.instagram.com/jeminofficial/', 500, 19, 'https://i.pravatar.cc/150?u=d19', ARRAY[]),
('d20', 'Madman', '박우송', ARRAY['B-boying'], 'https://www.instagram.com/madman_park/', 480, 20, 'https://i.pravatar.cc/150?u=d20', ARRAY[]);

-- 추가 댄서들 (21-40명)
INSERT INTO dancers (id, nickname, name, genres, sns, total_points, rank, avatar, crew_ids) VALUES
('d21', 'Brother bin', '박형빈', ARRAY['Locking'], 'https://www.instagram.com/brother_bin/', 460, 21, 'https://i.pravatar.cc/150?u=d21', ARRAY[]),
('d22', 'C.Know', '강신호', ARRAY['Waacking'], 'https://www.instagram.com/c.know_k/', 440, 22, 'https://i.pravatar.cc/150?u=d22', ARRAY[]),
('d23', '5000', '신승훈', ARRAY['Hip-hop'], 'https://www.instagram.com/5000rpsn.kr/', 420, 23, 'https://i.pravatar.cc/150?u=d23', ARRAY[]),
('d24', 'B1', '엄혜성', ARRAY['B-boying'], 'https://www.instagram.com/yuseonyeong8474', 400, 24, 'https://i.pravatar.cc/150?u=d24', ARRAY[]),
('d25', 'Rush', '최동욱', ARRAY['B-boying'], 'https://www.instagram.com/bboyrush88', 380, 25, 'https://i.pravatar.cc/150?u=d25', ARRAY[]),
('d26', 'Melman', '멜먼', ARRAY['Popping'], 'https://www.instagram.com/melman_justevee/', 360, 26, 'https://i.pravatar.cc/150?u=d26', ARRAY[]),
('d27', 'Dandy', '댄디', ARRAY['Popping'], 'https://www.instagram.com/dandy_popping/', 340, 27, 'https://i.pravatar.cc/150?u=d27', ARRAY[]),
('d28', 'Troydi', '트로이디', ARRAY['House'], 'https://www.instagram.com/troydi_house/', 320, 28, 'https://i.pravatar.cc/150?u=d28', ARRAY[]),
('d29', 'ONEBell', '원벨', ARRAY['Hip-hop'], 'https://www.instagram.com/onebell_hiphop/', 300, 29, 'https://i.pravatar.cc/150?u=d29', ARRAY[]),
('d30', 'Rhythmgate', '리듬게이트', ARRAY['Hip-hop'], 'https://www.instagram.com/rhythmgate/', 280, 30, 'https://i.pravatar.cc/150?u=d30', ARRAY[]),
('d31', 'Stonelock', '스톤락', ARRAY['Locking'], 'https://www.instagram.com/stonelock_/', 260, 31, 'https://i.pravatar.cc/150?u=d31', ARRAY[]),
('d32', 'Octopus', '옥토퍼스', ARRAY['B-boying'], 'https://www.instagram.com/octopus_jinjo/', 240, 32, 'https://i.pravatar.cc/150?u=d32', ARRAY[]),
('d33', 'Vero', '베로', ARRAY['B-boying'], 'https://www.instagram.com/vero_jinjo/', 220, 33, 'https://i.pravatar.cc/150?u=d33', ARRAY[]),
('d34', 'D.sleep', '디슬립', ARRAY['B-boying'], 'https://www.instagram.com/dsleep_jinjo/', 200, 34, 'https://i.pravatar.cc/150?u=d34', ARRAY[]),
('d35', 'Edwardelric', '에드워드엘릭', ARRAY['B-boying'], 'https://www.instagram.com/edwardelric_/', 180, 35, 'https://i.pravatar.cc/150?u=d35', ARRAY[]),
('d36', 'Heady', '헤디', ARRAY['B-boying'], 'https://www.instagram.com/heady_artistreet/', 160, 36, 'https://i.pravatar.cc/150?u=d36', ARRAY[]),
('d37', 'Millie', '밀리', ARRAY['B-boying'], 'https://www.instagram.com/millie_flowxl/', 140, 37, 'https://i.pravatar.cc/150?u=d37', ARRAY[]),
('d38', 'Chase', '체이스', ARRAY['B-boying'], 'https://www.instagram.com/chase_eeight/', 120, 38, 'https://i.pravatar.cc/150?u=d38', ARRAY[]),
('d39', 'Locker ZEE', '김민지', ARRAY['Locking'], 'https://www.instagram.com/locker.zee/tagged/', 100, 39, 'https://i.pravatar.cc/150?u=d39', ARRAY[]),
('d40', 'Eagle', '이상진', ARRAY['B-boying'], 'https://www.instagram.com/eagleone_bboykr/', 80, 40, 'https://i.pravatar.cc/150?u=d40', ARRAY[]);

-- 크루 데이터
INSERT INTO crews (id, name, description, founded_year, location, member_count) VALUES
('crew1', 'JINJO CREW', 'World famous B-boy crew from Korea', 2001, 'Seoul', 8),
('crew2', 'WAACKING QUEENS', 'Leading waacking crew in Korea', 2015, 'Seoul', 6),
('crew3', '1MILLION DANCE STUDIO', 'Global choreography powerhouse', 2014, 'Seoul', 12),
('crew4', 'VOGUE FEVER', 'Ballroom and vogue culture crew', 2018, 'Seoul', 5),
('crew5', 'HIPHOP UNITY', 'Old school hip-hop preservation crew', 2010, 'Busan', 7),
('crew6', 'POPPING LEGENDS', 'Funk and popping specialists', 2012, 'Seoul', 9),
('crew7', 'LOCK N LOL', 'Locking dance crew', 2016, 'Daegu', 4),
('crew8', 'HOUSE NATION', 'House dance community', 2019, 'Seoul', 6),
('crew9', 'CHOREOGRAPHY COLLECTIVE', 'Modern choreography group', 2020, 'Seoul', 8);

-- 대회 데이터
INSERT INTO competitions (id, title, description, date, location, prize_pool, status, max_participants, entry_fee) VALUES
('comp1', 'Groove Seoul 2024', 'Korea''s biggest street dance battle', '2024-08-15', 'Olympic Park, Seoul', 50000000, 'completed', 128, 50000),
('comp2', 'B-Boy Championship', 'International breaking competition', '2024-09-20', 'KINTEX, Goyang', 30000000, 'completed', 64, 100000),
('comp3', 'Waacking Festival', 'Waacking dance celebration', '2024-12-01', 'Hongdae, Seoul', 20000000, 'upcoming', 32, 30000);

COMMIT; 