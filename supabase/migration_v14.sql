-- v14: 食事時間帯 + 街マスターを都道府県紐付け + 主要都市大量追加

-- ============ spots.meal_times ============
alter table public.spots add column if not exists meal_times text[] not null default '{}';

-- ============ master_cities.prefecture ============
alter table public.master_cities add column if not exists prefecture text;
create index if not exists master_cities_prefecture_idx on public.master_cities(prefecture);

-- 既存データの都道府県バックフィル
update public.master_cities set prefecture = '北海道' where name in ('札幌','函館','小樽','ニセコ','旭川');
update public.master_cities set prefecture = '青森県' where name in ('青森','弘前');
update public.master_cities set prefecture = '岩手県' where name in ('盛岡','一関');
update public.master_cities set prefecture = '宮城県' where name in ('仙台');
update public.master_cities set prefecture = '秋田県' where name in ('秋田');
update public.master_cities set prefecture = '山形県' where name in ('山形','鶴岡','米沢');
update public.master_cities set prefecture = '福島県' where name in ('福島','会津若松');
update public.master_cities set prefecture = '茨城県' where name in ('水戸','つくば');
update public.master_cities set prefecture = '栃木県' where name in ('宇都宮','日光','那須');
update public.master_cities set prefecture = '群馬県' where name in ('高崎','前橋','草津');
update public.master_cities set prefecture = '埼玉県' where name in ('大宮','浦和','川越');
update public.master_cities set prefecture = '千葉県' where name in ('千葉市','浦安','成田','館山');
update public.master_cities set prefecture = '東京都' where name in (
  '銀座','麻布','六本木','渋谷','新宿','表参道','恵比寿','中目黒','自由が丘','浅草',
  '上野','神楽坂','神田','赤坂','神保町','池袋','丸の内','日本橋','西麻布','白金',
  '広尾','代官山','青山','原宿','品川'
);
update public.master_cities set prefecture = '神奈川県' where name in ('横浜','鎌倉','箱根','湘南','川崎','葉山');
update public.master_cities set prefecture = '新潟県' where name in ('新潟','燕三条');
update public.master_cities set prefecture = '富山県' where name in ('富山','高岡');
update public.master_cities set prefecture = '石川県' where name in ('金沢','加賀','輪島');
update public.master_cities set prefecture = '福井県' where name in ('福井','永平寺');
update public.master_cities set prefecture = '山梨県' where name in ('甲府','河口湖');
update public.master_cities set prefecture = '長野県' where name in ('長野','軽井沢','松本');
update public.master_cities set prefecture = '岐阜県' where name in ('岐阜','高山');
update public.master_cities set prefecture = '静岡県' where name in ('静岡','浜松','熱海','伊豆');
update public.master_cities set prefecture = '愛知県' where name in ('名古屋','栄');
update public.master_cities set prefecture = '三重県' where name in ('伊勢','鳥羽');
update public.master_cities set prefecture = '滋賀県' where name in ('大津','彦根');
update public.master_cities set prefecture = '京都府' where name in ('祇園','嵐山','先斗町','河原町','木屋町','烏丸','京都駅周辺','御所周辺');
update public.master_cities set prefecture = '大阪府' where name in ('北新地','心斎橋','難波','梅田','福島(大阪)','中之島','天王寺');
update public.master_cities set prefecture = '兵庫県' where name in ('三宮','神戸','芦屋','西宮','姫路','城崎');
update public.master_cities set prefecture = '奈良県' where name in ('奈良','飛鳥');
update public.master_cities set prefecture = '和歌山県' where name in ('和歌山','白浜','那智勝浦');
update public.master_cities set prefecture = '鳥取県' where name = '鳥取';
update public.master_cities set prefecture = '島根県' where name in ('松江','出雲');
update public.master_cities set prefecture = '岡山県' where name in ('岡山','倉敷');
update public.master_cities set prefecture = '広島県' where name in ('広島','宮島');
update public.master_cities set prefecture = '山口県' where name in ('山口','萩');
update public.master_cities set prefecture = '徳島県' where name = '徳島';
update public.master_cities set prefecture = '香川県' where name in ('高松','直島');
update public.master_cities set prefecture = '愛媛県' where name in ('松山','道後');
update public.master_cities set prefecture = '高知県' where name = '高知';
update public.master_cities set prefecture = '福岡県' where name in ('福岡','博多','中洲','大濠');
update public.master_cities set prefecture = '佐賀県' where name = '佐賀';
update public.master_cities set prefecture = '長崎県' where name in ('長崎','雲仙','佐世保');
update public.master_cities set prefecture = '熊本県' where name in ('熊本','阿蘇');
update public.master_cities set prefecture = '大分県' where name in ('大分','別府','由布院');
update public.master_cities set prefecture = '宮崎県' where name = '宮崎';
update public.master_cities set prefecture = '鹿児島県' where name in ('鹿児島','屋久島');
update public.master_cities set prefecture = '沖縄県' where name in ('那覇','石垣','宮古島','沖縄本島北部','美ら海');

-- ============ 主要都市・地域を大量追加 ============
insert into public.master_cities (name, prefecture, display_order) values
  -- 東京都 (40+)
  ('麻布十番','東京都',180),('白金台','東京都',181),('大手町','東京都',182),
  ('有楽町','東京都',183),('月島','東京都',184),('築地','東京都',185),
  ('豊洲','東京都',186),('門前仲町','東京都',187),('蔵前','東京都',188),
  ('押上','東京都',189),('お台場','東京都',190),('二子玉川','東京都',191),
  ('三軒茶屋','東京都',192),('下北沢','東京都',193),('吉祥寺','東京都',194),
  ('高円寺','東京都',195),('中野','東京都',196),('荻窪','東京都',197),
  ('国立','東京都',198),('立川','東京都',199),('八王子','東京都',200),
  ('町田','東京都',201),('千駄ヶ谷','東京都',202),('代々木','東京都',203),
  ('飯田橋','東京都',204),('後楽園','東京都',205),('神宮前','東京都',206),
  ('清澄白河','東京都',207),
  -- 神奈川県 (30+)
  ('みなとみらい','神奈川県',220),('中華街','神奈川県',221),('元町(横浜)','神奈川県',222),
  ('横浜駅周辺','神奈川県',223),('馬車道','神奈川県',224),('関内','神奈川県',225),
  ('山下公園','神奈川県',226),('北鎌倉','神奈川県',227),('由比ヶ浜','神奈川県',228),
  ('七里ヶ浜','神奈川県',229),('大船','神奈川県',230),('藤沢','神奈川県',231),
  ('江の島','神奈川県',232),('茅ヶ崎','神奈川県',233),('平塚','神奈川県',234),
  ('逗子','神奈川県',235),('三浦','神奈川県',236),('横須賀','神奈川県',237),
  ('武蔵小杉','神奈川県',238),('溝の口','神奈川県',239),('鶴見','神奈川県',240),
  ('強羅','神奈川県',241),('仙石原','神奈川県',242),('湯本','神奈川県',243),
  ('小田原','神奈川県',244),('真鶴','神奈川県',245),('湯河原','神奈川県',246),
  ('厚木','神奈川県',247),('海老名','神奈川県',248),('相模原','神奈川県',249),
  -- 大阪府 (30+)
  ('本町','大阪府',270),('京橋','大阪府',271),('西天満','大阪府',272),
  ('堂島','大阪府',273),('北浜','大阪府',274),('谷町','大阪府',275),
  ('道頓堀','大阪府',276),('法善寺','大阪府',277),('千日前','大阪府',278),
  ('アメ村','大阪府',279),('堀江','大阪府',280),('南船場','大阪府',281),
  ('鶴橋','大阪府',282),('玉造','大阪府',283),('江坂','大阪府',284),
  ('千里中央','大阪府',285),('高槻','大阪府',286),('茨木','大阪府',287),
  ('豊中','大阪府',288),('池田','大阪府',289),('箕面','大阪府',290),
  ('吹田','大阪府',291),('枚方','大阪府',292),('堺','大阪府',293),
  ('岸和田','大阪府',294),('心斎橋筋','大阪府',295),('大阪駅周辺','大阪府',296),
  -- 京都府 (30+)
  ('三条','京都府',310),('四条','京都府',311),('五条','京都府',312),
  ('七条','京都府',313),('哲学の道','京都府',314),('銀閣寺周辺','京都府',315),
  ('金閣寺周辺','京都府',316),('清水寺周辺','京都府',317),('二条城周辺','京都府',318),
  ('北山','京都府',319),('大原','京都府',320),('八瀬','京都府',321),
  ('比叡山','京都府',322),('鞍馬','京都府',323),('貴船','京都府',324),
  ('伏見','京都府',325),('桂','京都府',326),('太秦','京都府',327),
  ('嵯峨野','京都府',328),('宇治','京都府',329),('天橋立','京都府',330),
  ('舞鶴','京都府',331),('福知山','京都府',332),('亀岡','京都府',333),
  ('寺町','京都府',334),('西陣','京都府',335),('北野','京都府',336),
  ('東山','京都府',337),
  -- 兵庫県 (20+)
  ('元町(神戸)','兵庫県',360),('北野(神戸)','兵庫県',361),('旧居留地','兵庫県',362),
  ('灘','兵庫県',363),('須磨','兵庫県',364),('垂水','兵庫県',365),
  ('明石','兵庫県',366),('加古川','兵庫県',367),('出石','兵庫県',368),
  ('豊岡','兵庫県',369),('香住','兵庫県',370),('淡路島','兵庫県',371),
  ('洲本','兵庫県',372),('有馬温泉','兵庫県',373),('六甲山','兵庫県',374),
  ('宝塚','兵庫県',375),('伊丹','兵庫県',376),('尼崎','兵庫県',377),
  -- 愛知県 (15+)
  ('矢場町','愛知県',400),('大須','愛知県',401),('名駅','愛知県',402),
  ('金山','愛知県',403),('千種','愛知県',404),('覚王山','愛知県',405),
  ('本山','愛知県',406),('八事','愛知県',407),('一宮','愛知県',408),
  ('豊田','愛知県',409),('岡崎','愛知県',410),('豊橋','愛知県',411),
  ('蒲郡','愛知県',412),('常滑','愛知県',413),('セントレア','愛知県',414),
  -- 福岡県 (15+)
  ('天神','福岡県',430),('警固','福岡県',431),('薬院','福岡県',432),
  ('平尾','福岡県',433),('大名','福岡県',434),('今泉','福岡県',435),
  ('西新','福岡県',436),('百道','福岡県',437),('香椎','福岡県',438),
  ('小倉','福岡県',439),('門司','福岡県',440),('久留米','福岡県',441),
  ('大牟田','福岡県',442),('太宰府','福岡県',443),
  -- 北海道 (10+)
  ('ススキノ','北海道',460),('大通','北海道',461),('円山','北海道',462),
  ('富良野','北海道',463),('美瑛','北海道',464),('倶知安','北海道',465),
  ('帯広','北海道',466),('釧路','北海道',467),('知床','北海道',468),
  ('稚内','北海道',469),
  -- 沖縄県 (15+)
  ('国際通り','沖縄県',490),('首里','沖縄県',491),('浦添','沖縄県',492),
  ('北谷','沖縄県',493),('嘉手納','沖縄県',494),('宜野湾','沖縄県',495),
  ('沖縄市','沖縄県',496),('うるま','沖縄県',497),('名護','沖縄県',498),
  ('本部','沖縄県',499),('恩納','沖縄県',500),('読谷','沖縄県',501),
  ('川平','沖縄県',502),('伊良部','沖縄県',503),('久米島','沖縄県',504),
  ('慶良間','沖縄県',505),('西表','沖縄県',506)
on conflict (name) do update set
  prefecture = excluded.prefecture,
  display_order = excluded.display_order;

NOTIFY pgrst, 'reload schema';
