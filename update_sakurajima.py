#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
気象庁公式XMLおよび鹿児島市桜島フェリー公式から最新情報を自動取得し、
sakurajima.json を更新するスクリプト。
APIキー不要・完全無料の公式オープンデータを利用。
"""

import os
import sys
import json
import datetime
import urllib.request
import xml.etree.ElementTree as ET

DATA_FILE = os.path.join(os.path.dirname(__file__), "sakurajima.json")

def fetch_jma_sakurajima():
    """気象庁の地震火山XMLフィードから桜島の最新情報を取得"""
    feed_url = "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml"
    req = urllib.request.Request(feed_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    
    with urllib.request.urlopen(req, timeout=10) as res:
        xml_content = res.read()
    
    root = ET.fromstring(xml_content)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    
    entries = root.findall("atom:entry", ns)
    
    latest_eruption = None
    latest_ashfall = None
    alert_level = "レベル3（入山規制）" # 桜島の基底レベル（電文中にあれば更新）
    
    for e in entries:
        title = e.find("atom:title", ns).text or ""
        updated = e.find("atom:updated", ns).text or ""
        link = e.find("atom:link", ns).attrib.get("href", "")
        
        # 1. 噴火に関する火山観測報 (VFVO52)
        if "VFVO52" in link and not latest_eruption:
            try:
                r = urllib.request.urlopen(urllib.request.Request(link, headers={"User-Agent": "Mozilla/5.0"}), timeout=5)
                doc = r.read().decode("utf-8")
                if "桜島" in doc:
                    root_elem = ET.fromstring(doc.encode("utf-8"))
                    text_parts = []
                    report_time = ""
                    for elem in root_elem.iter():
                        tag = elem.tag.split("}")[-1]
                        if tag == "ReportDateTime" and elem.text:
                            report_time = elem.text.strip()
                        elif tag == "Text" and elem.text:
                            text_parts.append(elem.text.strip())
                    
                    full_text = "\n".join(text_parts)
                    latest_eruption = {
                        "title": title,
                        "updated": updated,
                        "reportTime": report_time,
                        "text": full_text if full_text else "噴火が観測されました",
                        "link": link
                    }
            except Exception as err:
                print(f"Error parsing VFVO52: {err}", file=sys.stderr)

        # 2. 降灰予報 (VFVO53)
        if "VFVO53" in link and not latest_ashfall:
            try:
                r = urllib.request.urlopen(urllib.request.Request(link, headers={"User-Agent": "Mozilla/5.0"}), timeout=5)
                doc = r.read().decode("utf-8")
                if "桜島" in doc:
                    root_elem = ET.fromstring(doc.encode("utf-8"))
                    text_parts = []
                    report_time = ""
                    for elem in root_elem.iter():
                        tag = elem.tag.split("}")[-1]
                        if tag == "ReportDateTime" and elem.text:
                            report_time = elem.text.strip()
                        elif tag == "Text" and elem.text:
                            text_parts.append(elem.text.strip())
                    
                    full_text = "\n".join(text_parts)
                    # 警戒レベルの抽出
                    if "噴火警戒レベル３" in full_text:
                        alert_level = "レベル3（入山規制）"
                    elif "噴火警戒レベル２" in full_text:
                        alert_level = "レベル2（火口周辺規制）"
                    elif "噴火警戒レベル４" in full_text:
                        alert_level = "レベル4（高齢者等避難）"
                    elif "噴火警戒レベル５" in full_text:
                        alert_level = "レベル5（避難）"

                    latest_ashfall = {
                        "title": title,
                        "updated": updated,
                        "reportTime": report_time,
                        "text": full_text,
                        "link": link
                    }
            except Exception as err:
                print(f"Error parsing VFVO53: {err}", file=sys.stderr)

        if latest_eruption and latest_ashfall:
            break

    return {
        "alertLevel": alert_level,
        "eruption": latest_eruption,
        "ashfall": latest_ashfall
    }

def fetch_ferry_status():
    """鹿児島市船舶局の桜島フェリー公式ページを確認"""
    url = "https://www.city.kagoshima.lg.jp/sakurajima-ferry/"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    check_time = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y年%m月%d日 %H:%M")
    
    # 推測による「通常運航」を排除し、鹿児島市船舶局の公式案内に厳密に準拠
    status = "最新の運航状況は公式SNSで確認してください"
    badge = "info"
    note = "鹿児島市船舶局公式案内：運航の再開や見合わせ、車両乗船待ちなどのリアルタイム運航状況は公式SNS（X）にて発信されています。"
    
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            html = res.read().decode("utf-8", errors="ignore")
            if "見合わせ" in html or "運休" in html or "欠航" in html:
                status = "【注意】運休・見合わせ関連の案内あり（公式SNSで要確認）"
                badge = "warning"
                note = "公式サイトに見合わせ・運休に関する告知が掲載されています。直ちに公式SNSをご確認ください。"
            else:
                status = "最新の運航状況は公式SNSで確認してください"
                badge = "info"
                note = "鹿児島市船舶局公式案内：運航の再開や見合わせ、車両乗船待ちなどのリアルタイム運航状況は公式SNS（X）にて発信されています。"
    except Exception as e:
        print(f"Error fetching ferry status: {e}", file=sys.stderr)
        status = "公式サイト確認不可（公式SNSを直接ご確認ください）"
        badge = "warning"
        note = "公式サイトへの接続に失敗しました。公式SNS（X）にて直接運航状況をご確認ください。"
        
    return {
        "status": status,
        "badge": badge,
        "note": note,
        "checkedAt": check_time,
        "officialNotice": "運航状況は公式SNSをご確認ください（鹿児島市船舶局公式）",
        "officialUrl": "https://www.city.kagoshima.lg.jp/sakurajima-ferry/",
        "officialStatusUrl": "https://www.city.kagoshima.lg.jp/sakurajima-ferry/unko_jokyo/unkojyokyo.html",
        "officialSns": "https://x.com/sakurajimaf2525/"
    }

def update_sakurajima_data():
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    now_str = now.strftime("%Y年%m月%d日 %H:%M")
    iso_now = now.isoformat()
    
    print(f"[{now_str}] 気象庁および鹿児島市公式データ取得を開始...")
    
    try:
        volcano_data = fetch_jma_sakurajima()
        ferry_data = fetch_ferry_status()
        
        result = {
            "status": "success",
            "fetchedAt": iso_now,
            "fetchedAtDisplay": now_str,
            "volcano": {
                "alertLevel": volcano_data["alertLevel"],
                "alertColor": "warning",
                "latestEruption": volcano_data["eruption"],
                "ashfallForecast": volcano_data["ashfall"],
                "touristImpact": "湯之平展望所、有村溶岩展望所など海岸沿いの主要観光スポットは火口2km規制外のため通常通り観光可能です。",
                "windDirection": "気象庁の降灰予報による風向き・降灰予想エリアをご確認ください。",
                "tips": "降灰時はコンタクトレンズではなくメガネの着用を推奨。目薬やマスクがあると安心です。"
            },
            "ferry": ferry_data,
            "bus": {
                "name": "サクラジマアイランドビュー（周遊観光バス）",
                "status": "通常運行中",
                "badge": "success",
                "hours": "9:30〜16:30（30分間隔）",
                "detail": "桜島港を起点に、烏島展望所・赤水展望広場・湯之平展望所などを約60分で循環します。"
            },
            "officialLinks": {
                "jmaVolcano": "https://www.data.jma.go.jp/svd/vois/data/tokyo/506_Sakurajima/506_index.html",
                "jmaAshfall": "https://www.jma.go.jp/bosai/map.html#5/31.593/130.639/&elem=ash&contents=volcano_ash",
                "cityFerry": "https://www.city.kagoshima.lg.jp/sakurajima-ferry/",
                "cityFerryX": "https://x.com/sakurajimaf2525/"
            }
        }
        JS_FILE = os.path.join(os.path.dirname(__file__), "sakurajima.js")

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            
        with open(JS_FILE, "w", encoding="utf-8") as f:
            f.write(f"// 自動生成された桜島・フェリー最新公式データ\nwindow.SAKURAJIMA_DATA = {json.dumps(result, ensure_ascii=False, indent=2)};\n")
            
        print(f"成功: {DATA_FILE} および {JS_FILE} を更新しました。")
        return True
    except Exception as e:
        print(f"取得失敗: {e}", file=sys.stderr)
        error_result = {
            "status": "error",
            "fetchedAt": iso_now,
            "fetchedAtDisplay": now_str,
            "errorMessage": f"気象庁・鹿児島市公式データの取得に失敗しました: {e}",
            "officialLinks": {
                "jmaVolcano": "https://www.data.jma.go.jp/svd/vois/data/tokyo/506_Sakurajima/506_index.html",
                "jmaAshfall": "https://www.jma.go.jp/bosai/map.html#5/31.593/130.639/&elem=ash&contents=volcano_ash",
                "cityFerry": "https://www.city.kagoshima.lg.jp/sakurajima-ferry/",
                "cityFerryX": "https://x.com/sakurajimaf2525/"
            }
        }
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(error_result, f, ensure_ascii=False, indent=2)
        with open(JS_FILE, "w", encoding="utf-8") as f:
            f.write(f"window.SAKURAJIMA_DATA = {json.dumps(error_result, ensure_ascii=False, indent=2)};\n")
        return False

if __name__ == "__main__":
    success = update_sakurajima_data()
    sys.exit(0 if success else 1)
