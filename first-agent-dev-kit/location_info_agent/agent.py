from google.adk.agents import Agent

# Extracted Pokemon Center data (from comments)
ALL_POKEMON_CENTERS = [
    {"name": "ポケモンセンターサッポロ", "city": "札幌市", "prefecture": "hokkaido"},
    {"name": "ポケモンストア 新千歳空港店", "city": "千歳市", "prefecture": "hokkaido"},
    {"name": "ポケモンセンタートウホク", "city": "仙台市", "prefecture": "miyagi"},
    {"name": "ポケモンセンタートウキョーDX ＆ ポケモンカフェ", "city": "中央区", "prefecture": "tokyo"},
    {"name": "ポケモンセンターメガトウキョー ＆ ピカチュウスイーツ", "city": "豊島区", "prefecture": "tokyo"},
    {"name": "ポケモンセンターシブヤ", "city": "渋谷区", "prefecture": "tokyo"},
    {"name": "ポケモンセンタースカイツリータウン", "city": "墨田区", "prefecture": "tokyo"},
    {"name": "ポケモンセンターヨコハマ", "city": "横浜市", "prefecture": "kanagawa"},
    {"name": "ポケモンストア 成田空港店", "city": "成田市", "prefecture": "chiba"},
    {"name": "ポケモンストア 御殿場店", "city": "御殿場市", "prefecture": "shizuoka"},
    {"name": "ポケモンセンターカナザワ", "city": "金沢市", "prefecture": "ishikawa"},
    {"name": "ポケモンストア 中部国際空港店", "city": "常滑市", "prefecture": "aichi"},
    {"name": "ポケモンセンターオーサカ", "city": "大阪市", "prefecture": "osaka"},
    {"name": "ポケモンストア 関西空港店", "city": "泉佐野市", "prefecture": "osaka"},
    {"name": "ポケモンセンターキョウト", "city": "京都市", "prefecture": "kyoto"},
    {"name": "ポケモンセンターヒロシマ", "city": "広島市", "prefecture": "hiroshima"},
    {"name": "ポケモンストア エミフルMASAKI店", "city": "伊予郡松前町", "prefecture": "ehime"},
    {"name": "ポケモンセンター出張所 in JR高松駅", "city": "高松市", "prefecture": "kagawa"}, # Note: Assuming "city" is 高松市
    {"name": "ポケモンセンターフクオカ", "city": "福岡市", "prefecture": "fukuoka"},
    {"name": "ポケモンストア アミュプラザ博多店", "city": "福岡市", "prefecture": "fukuoka"},
    {"name": "ポケモンストア アミュプラザおおいた店", "city": "大分市", "prefecture": "oita"},
    {"name": "ポケモンストア アミュプラザ鹿児島店", "city": "鹿児島市", "prefecture": "kagoshima"},
    {"name": "ポケモンストア デパートリウボウ店", "city": "那覇市", "prefecture": "okinawa"},
]


def get_pokemon_center(city: str) -> dict:
    """Returns the Pokemon Center(s) in a specified city.

    Args:
        city (str): The name of the city for which to retrieve the Pokemon Center.

    Returns:
        dict: status and result or error msg.
    """
    found_centers = [
        center for center in ALL_POKEMON_CENTERS if center["city"] == city
    ]

    if found_centers:
        return {
            "status": "success",
            "centers": found_centers,
        }
    else:
        return {
            "status": "error",
            "error_message": f"Sorry, I don't have Pokemon Center information for {city}.",
        }

# Updated Agent definition
root_agent = Agent(
    name="location_info_agent", # Renamed for broader scope
    model="gemini-2.0-flash-exp", # Specify your desired model
    description=(
        "Agent to answer questions about Pokemon Centers in a city."
    ),
    instruction=(
        "I can answer your questions about Pokemon Centers in various cities."
    ),
    tools=[get_pokemon_center], # Added get_pokemon_center
)