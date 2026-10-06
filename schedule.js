// 鹿児島旅行 2泊3日モデルスケジュール公式データ
window.SCHEDULE_DATA = {
  "title": "鹿児島 2泊3日 一人旅モデルスケジュール",
  "dates": "2026年10月22日(木)〜10月24日(土)",
  "flightInfo": {
    "outbound": "10/22(木) スカイマーク SKY303便 羽田 08:40発 → 鹿児島 10:40着",
    "inbound": "10/24(土) スカイマーク 11時台便 鹿児島発 → 羽田 13:20着"
  },
  "hotelInfo": {
    "name": "ホテルタイセイ",
    "location": "鹿児島中央駅東口 徒歩約5分（鹿児島市中央町4-32）",
    "checkin": "15:00〜",
    "checkout": "〜10:00",
    "tip": "チェックイン前・チェックアウト後もフロントで荷物一時預かり可能"
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "2026年10月22日（木）",
      "subtitle": "✈️ 羽田発・鹿児島到着＆市内歴史めぐり・天文館ディナー",
      "summary": "朝のスカイマーク便で鹿児島へ。中央駅で荷物を預けて身軽になった後、アミュプラザ観覧車や城山・鶴丸城御楼門など薩摩の歴史スポットを巡り、夜は天文館で鹿児島郷土料理を堪能します。",
      "rainyOption": {
        "title": "🌧️ 1日目の雨天代替プラン",
        "desc": "雨天時は屋外の城山遊歩道を避け、屋内施設中心のルートが快適です。",
        "spots": [
          {
            "name": "鹿児島県歴史・美術センター 黎明館",
            "detail": "鶴丸城本丸跡にある大規模な屋内博物館。御楼門のすぐ奥にあり、薩摩の歴史をじっくり学べます。"
          },
          {
            "name": "いおワールド かごしま水族館",
            "detail": "全天候型の大型水族館。黒潮大水槽のジンベエザメやイルカ、錦江湾の生物を快適に観賞。"
          },
          {
            "name": "アミュプラザ鹿児島 & 天文館アーケード",
            "detail": "どちらも屋根付きアーケードや商業施設のため、雨に濡れずにお買い物やカフェを楽しめます。"
          }
        ]
      },
      "timeline": [
        {
          "id": "s1_1",
          "time": "08:40〜10:40",
          "title": "羽田空港から鹿児島空港へフライト",
          "category": "flight",
          "icon": "✈️",
          "location": "羽田空港 第1ターミナル → 鹿児島空港",
          "transit": "スカイマーク（所要 約2時間）",
          "detail": "8:40 羽田発のスカイマーク便で出発。モバイルバッテリーは必ず手荷物（リュック内）に保持。機窓から富士山や九州の山並みを眺めつつ鹿児島空港へ。",
          "mapUrl": "https://maps.google.com/?q=鹿児島空港",
          "officialUrl": "https://www.skymark.co.jp/"
        },
        {
          "id": "s1_2",
          "time": "11:00〜11:45",
          "title": "鹿児島空港連絡バスで鹿児島中央駅へ移動",
          "category": "transit",
          "icon": "🚌",
          "location": "鹿児島空港 2番のりば → 鹿児島中央駅東口",
          "transit": "空港連絡バス（ノンストップ便で約40分・大人1,400円）",
          "detail": "到着口を出てすぐの2番のりばから乗車。予約不要の先着順。車窓からシラス台地や鹿児島の街並みが広がります。",
          "mapUrl": "https://maps.google.com/?q=鹿児島中央駅",
          "officialUrl": "https://nangoku-kotsu.com/timetable/airport/"
        },
        {
          "id": "s1_3",
          "time": "11:50〜12:05",
          "title": "ホテルタイセイに荷物を預ける",
          "category": "hotel",
          "icon": "🏨",
          "location": "ホテルタイセイ（鹿児島中央駅東口 徒歩5分）",
          "transit": "鹿児島中央駅東口から徒歩約5分",
          "detail": "駅到着後、まずはホテルタイセイのフロントへ。チェックイン前でも背負いバッグなどの手荷物を預かってもらえます。身軽になって観光へ出発！",
          "mapUrl": "https://maps.google.com/?q=ホテルタイセイ+鹿児島市中央町",
          "officialUrl": "https://www.taisei-grp.co.jp/taisei/"
        },
        {
          "id": "s1_4",
          "time": "12:10〜12:25",
          "title": "駅観光案内所でマップ入手＆1日乗車券購入",
          "category": "sightseeing",
          "icon": "ℹ️",
          "location": "鹿児島中央駅 総合観光案内所（改札正面 2Fコンコース）",
          "transit": "ホテルから徒歩5分で駅構内へ",
          "detail": "観光スタッフ常駐窓口で最新観光パンフレット・市街地マップを無料入手。「市電・市バス・シティビュー共通1日乗車券（700円）」を購入すると施設割引も受けられます。",
          "mapUrl": "https://maps.google.com/?q=鹿児島中央駅+総合観光案内所",
          "officialUrl": "https://www.kagoshima-yokanavi.jp/spot/20080"
        },
        {
          "id": "s1_5",
          "time": "12:30〜13:30",
          "title": "駅周辺で昼食＆アミュプラザ観覧車「アミュラン」",
          "category": "meal",
          "icon": "🎡",
          "location": "アミュプラザ鹿児島（中央駅直結）",
          "transit": "駅構内直結",
          "detail": "アミュプラザ地下またはぐるめ横丁で黒豚ランチ。その後屋上観覧車「アミュラン」へ（所要15分、地上91m）。1日乗車券提示で割引500円。鹿児島市街地と桜島を空中から一望！",
          "mapUrl": "https://maps.google.com/?q=アミュプラザ鹿児島",
          "officialUrl": "https://amu.jrkagoshimacity.com/"
        },
        {
          "id": "s1_6",
          "time": "13:40〜14:40",
          "title": "照國神社・西郷隆盛銅像・鶴丸城御楼門を巡る",
          "category": "sightseeing",
          "icon": "⛩️",
          "location": "城山麓の歴史エリア（照國神社〜西郷銅像〜御楼門）",
          "transit": "中央駅東4番からシティビュー約10分「薩摩義士碑前」下車、徒歩で散策",
          "detail": "3つの重要スポットは徒歩2〜3分圏内に集約。薩摩藩主・島津斉彬公を祀る「照國神社」、軍服姿の「西郷隆盛銅像」、2020年に復元された日本屈指の巨門「鶴丸城 御楼門」を見学。",
          "mapUrl": "https://maps.google.com/?q=鶴丸城御楼門",
          "officialUrl": "https://www.pref.kagoshima.jp/ab01/kyoiku-bunka/bunka/goromon/"
        },
        {
          "id": "s1_7",
          "time": "14:50〜15:45",
          "title": "カゴシマシティビューで城山展望台＆西郷洞窟へ",
          "category": "sightseeing",
          "icon": "🌄",
          "location": "城山展望台 & 西郷洞窟",
          "transit": "「薩摩義士碑前」からシティビューで「城山」下車（約8分）",
          "detail": "標高107mの「城山展望台」から、雄大な桜島と錦江湾のパノラマ絶景を堪能。遊歩道沿いには西南戦争の最終決戦地「西郷洞窟」もあり、幕末・維新の歴史を体感できます。",
          "mapUrl": "https://maps.google.com/?q=城山展望台+鹿児島",
          "officialUrl": "https://www.kagoshima-yokanavi.jp/spot/10008"
        },
        {
          "id": "s1_8",
          "time": "16:00〜17:00",
          "title": "ホテルタイセイに戻りチェックイン＆休憩",
          "category": "hotel",
          "icon": "🔑",
          "location": "ホテルタイセイ",
          "transit": "城山からシティビューで中央駅へ戻る（約25分）",
          "detail": "15時以降なのでホテルにチェックイン。預けた荷物を受け取り、部屋でシャワーや荷物整理をして夕方のお出かけ準備。ひと休みして体力を回復。",
          "mapUrl": "https://maps.google.com/?q=ホテルタイセイ+鹿児島市中央町",
          "officialUrl": "https://www.taisei-grp.co.jp/taisei/"
        },
        {
          "id": "s1_9",
          "time": "17:30〜20:30",
          "title": "天文館散策＆鹿児島郷土料理ディナー",
          "category": "meal",
          "icon": "🍽️",
          "location": "天文館アーケード街",
          "transit": "中央駅から市電で約7分「天文館通」下車",
          "detail": "南九州最大の繁華街「天文館」へ。一人旅におすすめの「吾愛人 本店（みそおでん・六白黒豚）」や「黒かつ亭（黒豚とんかつ）」、「豚とろラーメン」で贅沢な夕食を堪能（本アプリのグルメタブ参照）。",
          "mapUrl": "https://maps.google.com/?q=天文館通+鹿児島",
          "officialUrl": "https://tenmonkan.info/"
        },
        {
          "id": "s1_10",
          "time": "21:00",
          "title": "ホテルタイセイ帰着・明日の桜島観光に備える",
          "category": "hotel",
          "icon": "🛏️",
          "location": "ホテルタイセイ",
          "transit": "天文館通から市電で中央駅へ戻る（約7分）",
          "detail": "ホテルへ戻り、スマホやモバイルバッテリーを充電。本アプリで明日の桜島火山情報とフェリー時刻表を確認して就寝。",
          "mapUrl": "https://maps.google.com/?q=ホテルタイセイ+鹿児島市中央町",
          "officialUrl": "https://www.taisei-grp.co.jp/taisei/"
        }
      ]
    },
    {
      "dayNumber": 2,
      "date": "2026年10月23日（金）",
      "subtitle": "🌋 桜島フェリー＆サクラジマアイランドビュー周遊・仙巌園",
      "summary": "旅行のメインとなる桜島観光の日。24時間運航の桜島フェリーで渡り、周遊バス「サクラジマアイランドビュー」で湯之平展望所など主要スポットを巡ります。午後は島津家の名勝「仙巌園」へ足を伸ばします。",
      "rainyOption": {
        "title": "🌧️ 2日目の雨天代替プラン",
        "desc": "雨天や降灰時は、桜島内の屋内施設や温泉、市内の文化施設へ柔軟に切り替えられます。",
        "spots": [
          {
            "name": "桜島ビジターセンター & 桜島マグマ温泉",
            "detail": "フェリー港近くのビジターセンター（屋内大画面シアター・溶岩展示）と、国民宿舎レインボー桜島の天然温泉「マグマ温泉」でゆったり。"
          },
          {
            "name": "仙巌園 尚古集成館（世界遺産・国宝展示）",
            "detail": "日本初の近代西洋式工場跡を改修した屋内博物館。薩摩切子や島津家の貴重な歴史資料を雨でもじっくり鑑賞できます。"
          },
          {
            "name": "かごしま水族館（フェリーターミナル隣接）",
            "detail": "鹿児島港フェリー乗り場のすぐ隣。雨の日に桜島観光と組み合わせて訪れるのに最適です。"
          }
        ]
      },
      "timeline": [
        {
          "id": "s2_1",
          "time": "08:00〜08:35",
          "title": "ホテル出発・市電で鹿児島港へ移動",
          "category": "transit",
          "icon": "🚃",
          "location": "ホテルタイセイ → 鹿児島港フェリーターミナル",
          "transit": "市電2系統で「水族館口」下車（約15分）、徒歩約5分",
          "detail": "ホテルを出発し、市電に乗って海沿いの鹿児島港へ。朝のさわやかな空気を感じながらフェリーターミナルへ向かいます。",
          "mapUrl": "https://maps.google.com/?q=鹿児島港桜島フェリーターミナル",
          "officialUrl": "https://www.city.kagoshima.lg.jp/sakurajima-ferry/"
        },
        {
          "id": "s2_2",
          "time": "08:45〜09:00",
          "title": "桜島フェリー乗船・15分間の錦江湾クルーズ",
          "category": "transit",
          "icon": "🚢",
          "location": "鹿児島港 → 桜島港",
          "transit": "桜島フェリー（所要15分・大人250円）",
          "detail": "平日ダイヤは朝15分間隔で運航。甲板から錦江湾に迫る雄大な桜島を間近に眺望。名物の船内うどん「やぶ金」の香りが漂います。料金は桜島港到着時に後払い。",
          "mapUrl": "https://maps.google.com/?q=桜島フェリーターミナル",
          "officialUrl": "https://www.city.kagoshima.lg.jp/sakurajima-ferry/koro-jikoku/timetable.html"
        },
        {
          "id": "s2_3",
          "time": "09:05〜09:50",
          "title": "フェリーターミナル周辺散策（月読神社・足湯）",
          "category": "sightseeing",
          "icon": "♨️",
          "location": "月読神社 & 溶岩なぎさ公園足湯",
          "transit": "桜島港から徒歩約5〜8分",
          "detail": "桜島港正面の高台にあるパワースポット「月読神社」へ参拝。その後、錦江湾に面した全長100mの「溶岩なぎさ公園足湯（無料）」で雄大な景色を見ながら足湯体験（タオル持参）。",
          "mapUrl": "https://maps.google.com/?q=桜島溶岩なぎさ公園足湯",
          "officialUrl": "https://www.kagoshima-kankou.com/spot/10499"
        },
        {
          "id": "s2_4",
          "time": "10:00〜11:00",
          "title": "サクラジマアイランドビューで湯之平展望所へ",
          "category": "sightseeing",
          "icon": "🚌",
          "location": "サクラジマアイランドビュー周遊（湯之平展望所など）",
          "transit": "周遊バス「サクラジマアイランドビュー」（1日券500円・1周約55分）",
          "detail": "桜島港発の公式周遊バスに乗車。「烏島展望所（約5分停車）」、「赤水展望広場・叫びの肖像（約8分停車）」を経て、一般人が立ち入れる最高峰「湯之平展望所（標高373m・約15分停車）」へ。大迫力の山肌と360度の錦江湾大パノラマを満喫！",
          "mapUrl": "https://maps.google.com/?q=湯之平展望所+桜島",
          "officialUrl": "https://www.city.kagoshima.lg.jp/kotsu/cityview/islandview.html"
        },
        {
          "id": "s2_5",
          "time": "11:15〜12:30",
          "title": "桜島で昼食＆特産品お土産ショッピング",
          "category": "meal",
          "icon": "🍊",
          "location": "道の駅「桜島」火の島めぐみ館 または港周辺",
          "transit": "桜島港から徒歩約8分",
          "detail": "道の駅で名物の「桜島小みかんうどん」や桜島大根料理、カンパチ定食を堪能。ギネス記録の桜島大根加工品や小みかんスイーツ、溶岩加工品などの限定お土産を物色。",
          "mapUrl": "https://maps.google.com/?q=道の駅桜島火の島めぐみ館",
          "officialUrl": "https://www.sakurajima.gr.jp/megumi/"
        },
        {
          "id": "s2_6",
          "time": "12:45〜13:00",
          "title": "桜島フェリーで鹿児島市内へ戻る",
          "category": "transit",
          "icon": "🚢",
          "location": "桜島港 → 鹿児島港",
          "transit": "桜島フェリー（所要15分・毎時15分間隔）",
          "detail": "桜島港の改札口で運賃250円（ICカード可）を精算して乗船。振り返ると雄大な桜島が青空にそびえます。",
          "mapUrl": "https://maps.google.com/?q=鹿児島港桜島フェリーターミナル",
          "officialUrl": "https://www.city.kagoshima.lg.jp/sakurajima-ferry/"
        },
        {
          "id": "s2_7",
          "time": "13:20〜15:30",
          "title": "名勝 仙巌園（磯庭園）観光＆両棒餅カフェ休憩",
          "category": "sightseeing",
          "icon": "🏯",
          "location": "名勝 仙巌園（島津家別邸・世界文化遺産）",
          "transit": "鹿児島港／水族館前からカゴシマシティビューで約10分「仙巌園前」下車",
          "detail": "万治元年（1658年）築庭の島津家別邸。桜島を築山、錦江湾を池に見立てた圧巻の借景庭園を見学。園内茶屋で名物「両棒餅（ぢゃんぼもち）」を食べ比べ。世界遺産の尚古集成館や薩摩切子工場ショップも必見。",
          "mapUrl": "https://maps.google.com/?q=仙巌園",
          "officialUrl": "https://www.senganen.jp/"
        },
        {
          "id": "s2_8",
          "time": "16:00〜17:30",
          "title": "市内へ戻りカフェ休憩＆ホテルでリフレッシュ",
          "category": "sightseeing",
          "icon": "🍧",
          "location": "天文館むじゃき（白熊） または ホテルタイセイ",
          "transit": "仙巌園前からシティビューで天文館または中央駅へ（約20分）",
          "detail": "歩き疲れた体を癒やすため、天文館むじゃきで名物「白熊（一人用ベビーサイズ）」を楽しむか、ホテルタイセイへ戻りひと休み。ホテル館内のコインランドリーで衣類の洗濯も可能です。",
          "mapUrl": "https://maps.google.com/?q=天文館むじゃき+本店",
          "officialUrl": "https://mujyaki.co.jp/"
        },
        {
          "id": "s2_9",
          "time": "18:00〜20:30",
          "title": "鹿児島中央駅前「かごっまふるさと屋台村」ディナー",
          "category": "meal",
          "icon": "🍶",
          "location": "かごっまふるさと屋台村（Li-Ka1920 & バスチカ）",
          "transit": "ホテルから徒歩約3〜5分",
          "detail": "中央駅直結・隣接の屋台村へ。鹿児島の厳選食材（黒豚、地鶏、きびなご、島魚）と多彩な本格芋焼酎が小皿で楽しめる屋台が並び、一人旅でもカウンターで気軽に鹿児島情緒を満喫できます。",
          "mapUrl": "https://maps.google.com/?q=かごっまふるさと屋台村",
          "officialUrl": "https://kagoshima-yataimura.info/"
        },
        {
          "id": "s2_10",
          "time": "21:00",
          "title": "ホテルタイセイ帰着・明日のパッキング準備",
          "category": "hotel",
          "icon": "🧳",
          "location": "ホテルタイセイ",
          "transit": "屋台村から徒歩約5分",
          "detail": "ホテルへ戻り、持ち物チェックリストを開いて最終日のパッキングを確認。購入したお土産を整理し、明日の朝に備えます。",
          "mapUrl": "https://maps.google.com/?q=ホテルタイセイ+鹿児島市中央町",
          "officialUrl": "https://www.taisei-grp.co.jp/taisei/"
        }
      ]
    },
    {
      "dayNumber": 3,
      "date": "2026年10月24日（土）",
      "subtitle": "🛫 チェックアウト・空港連絡バス移動＆空港お土産・羽田帰着",
      "summary": "最終日はホテルをチェックアウトし、余裕を持って空港連絡バスで鹿児島空港へ。空港内で充実のお土産ショッピングや展望デッキ、名物天然温泉足湯を満喫し、11時台のスカイマーク便で羽田へ帰着します。",
      "rainyOption": {
        "title": "🌧️ 3日目の雨天代替プラン",
        "desc": "最終日は移動と空港がメインのため、雨天でもスケジュールに大きな影響はありません。",
        "spots": [
          {
            "name": "鹿児島空港 天然温泉足湯「おやっとさぁ」",
            "detail": "国内線ターミナル1Fにある屋根付き天然温泉足湯。空港内でゆったり旅の疲れをほぐせます。"
          },
          {
            "name": "空港内レストランで鶏飯・黒豚ランチ",
            "detail": "国内線3Fのレストラン街で、奄美名物「鶏飯（けいはん）」や黒豚料理を落ち着いて味わえます。"
          },
          {
            "name": "国内線2F 大規模お土産モール",
            "detail": "ドリームガーデンや山形屋、スカイショップなど全天候型モールで心ゆくまで買い物可能。"
          }
        ]
      },
      "timeline": [
        {
          "id": "s3_1",
          "time": "08:30〜08:50",
          "title": "ホテルタイセイをチェックアウト",
          "category": "hotel",
          "icon": "🏨",
          "location": "ホテルタイセイ",
          "transit": "徒歩で鹿児島中央ターミナルビルへ（約5分）",
          "detail": "部屋をチェックして忘れ物がないか確認（本アプリの持ち物チェック最終欄を参照）。フロントでチェックアウトし、東口向かいのバスターミナルへ向かいます。",
          "mapUrl": "https://maps.google.com/?q=ホテルタイセイ+鹿児島市中央町",
          "officialUrl": "https://www.taisei-grp.co.jp/taisei/"
        },
        {
          "id": "s3_2",
          "time": "09:00〜09:10",
          "title": "空港連絡バスターミナルへ移動＆乗車",
          "category": "transit",
          "icon": "🚏",
          "location": "鹿児島中央ターミナルビル 1F（南国交通バスターミナル 東21番）",
          "transit": "ソラリア西鉄ホテル1Fの屋内ターミナル",
          "detail": "道路を渡ってすぐの「鹿児島中央ターミナルビル1F」へ。券売機で乗車券（大人1,400円）を購入し、東21番のりばから9:10頃発の空港連絡バスに乗車。",
          "mapUrl": "https://maps.google.com/?q=鹿児島中央ターミナルビル",
          "officialUrl": "https://nangoku-kotsu.com/timetable/airport/"
        },
        {
          "id": "s3_3",
          "time": "09:10〜09:50",
          "title": "空港連絡バスで鹿児島空港へ移動",
          "category": "transit",
          "icon": "🚌",
          "location": "鹿児島中央駅 → 鹿児島空港",
          "transit": "空港連絡バス（ノンストップ直行便で約40分）",
          "detail": "九州自動車道を経由して快適に移動。09:50頃、鹿児島空港国内線ターミナル前に到着。フライト（11時台）の約1時間40分前に到着できるため、非常にゆとりがあります。",
          "mapUrl": "https://maps.google.com/?q=鹿児島空港",
          "officialUrl": "https://koj-ab.co.jp/"
        },
        {
          "id": "s3_4",
          "time": "09:55〜10:50",
          "title": "鹿児島空港でお土産ショッピング＆足湯「おやっとさぁ」",
          "category": "sightseeing",
          "icon": "🛍️",
          "location": "鹿児島空港 国内線ターミナル 1F〜3F",
          "transit": "空港ターミナル内を散策",
          "detail": "【2Fお土産売店】薩摩蒸氣屋の「かすたどん」、月揚庵の揚げたて「さつま揚げ」、かるかん饅頭、本格芋焼酎など名産品をチェック！【1F屋外】無料の天然温泉足湯「おやっとさぁ」で最後の足湯体験。【3F展望デッキ】霧島連山を背景に飛行機を見学。",
          "mapUrl": "https://maps.google.com/?q=鹿児島空港国内線ターミナル",
          "officialUrl": "https://koj-ab.co.jp/shops-and-restaurants/"
        },
        {
          "id": "s3_5",
          "time": "11:00〜11:20",
          "title": "保安検査場通過・搭乗口へ",
          "category": "flight",
          "icon": "🛂",
          "location": "国内線2F 保安検査場",
          "transit": "スカイマーク搭乗口へ",
          "detail": "出発の20分前までに保安検査場を通過。スマホのスカイマークQRコードを提示。モバイルバッテリーが手荷物に入っていることを最終確認。",
          "mapUrl": "https://maps.google.com/?q=鹿児島空港国内線ターミナル",
          "officialUrl": "https://www.skymark.co.jp/"
        },
        {
          "id": "s3_6",
          "time": "11:35〜13:20",
          "title": "スカイマーク便で鹿児島空港から羽田空港へ帰着",
          "category": "flight",
          "icon": "✈️",
          "location": "鹿児島空港 → 羽田空港 第1ターミナル",
          "transit": "スカイマーク（所要 約1時間45分）",
          "detail": "11時台のスカイマーク便に搭乗し東京へ。13:20頃、羽田空港へ無事到着。楽しかった2泊3日の鹿児島一人旅が完了です。お疲れ様でした！",
          "mapUrl": "https://maps.google.com/?q=羽田空港第1ターミナル",
          "officialUrl": "https://www.skymark.co.jp/"
        }
      ]
    }
  ]
};
