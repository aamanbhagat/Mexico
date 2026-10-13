"""Independent re-derivation of the pt-BR land-unit examples with Python Fractions.

Reads the catalog JSON (not the TypeScript engine) and recomputes every worked example in
src/content/pt-br/examples.ts. The unit tests then compare the engine's output with the
figures printed here, so two separate implementations must agree.

    python3 -I tests/golden/land_units.py
"""
from fractions import Fraction
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
catalog = json.loads((ROOT / "src/data/parameters/br/land-units.json").read_text())["versions"][-1]["value"]
AREA = {u["id"]: Fraction(u["m2"]) for u in catalog["units"]}
BRACA = Fraction(catalog["linear"]["meters"])


def half_even(x: Fraction, places: int) -> str:
    scaled = x * 10**places
    q, r = divmod(scaled.numerator, scaled.denominator)
    twice = 2 * r
    if twice > scaled.denominator or (twice == scaled.denominator and q % 2 == 1):
        q += 1
    s = str(q).rjust(places + 1, "0")
    return f"{s[:-places]}.{s[-places:]}" if places else s


def exact(x: Fraction) -> str | None:
    d = x.denominator
    for p in (2, 5):
        while d % p == 0:
            d //= p
    if d != 1:
        return None
    for k in range(0, 40):
        if (x * 10**k).denominator == 1:
            return half_even(x, k)
    return None


AREA_CASES = [
    ("sitio-3-paulistas", "3", "alqueire-paulista", "ha"),
    ("paulista-em-acres", "1", "alqueire-paulista", "acre"),
    ("fazenda-120ha-goiano", "120", "ha", "alqueire-mineiro"),
    ("litros-por-mineiro", "80", "litro", "alqueire-mineiro"),
    ("litros-por-paulista", "40", "litro", "alqueire-paulista"),
    ("baiano-2", "2", "alqueire-baiano", "ha"),
    ("baiano-2-como-mineiro", "2", "alqueire-mineiro", "ha"),
    ("alqueirao-em-baianos", "1", "alqueirao", "alqueire-baiano"),
    ("hectares-em-baianos", "100", "ha", "alqueire-baiano"),
    ("norte-5", "5", "alqueire-norte", "ha"),
    ("norte-100", "100", "alqueire-norte", "ha"),
    ("tarefas-baianas-10", "10", "tarefa-baiana", "ha"),
    ("tarefas-cearenses-5", "5", "tarefa-cearense", "ha"),
    ("tarefas-al-se-20", "20", "tarefa-al-se", "ha"),
    ("tarefas-25x25-20", "20", "tarefa-25x25", "ha"),
    ("litros-12", "12", "litro", "m2"),
    ("litros-12-ha", "12", "litro", "ha"),
    ("hectares-50-paulista", "50", "ha", "alqueire-paulista"),
    ("hectares-50-mineiro", "50", "ha", "alqueire-mineiro"),
    ("hectare-1-paulista", "1", "ha", "alqueire-paulista"),
    ("quadras-gauchas-10", "10", "quadra-gaucha", "ha"),
]

PRICE_CASES = [
    ("preco-paulista", "72600", "alqueire-paulista", "ha"),
    ("preco-mineiro", "150000", "alqueire-mineiro", "ha"),
    ("preco-ha-em-baiano", "20000", "ha", "alqueire-baiano"),
]

if __name__ == "__main__":
    for case, amount, src, dst in AREA_CASES:
        value = Fraction(amount) * AREA[src] / AREA[dst]
        print(f"{case:24} {amount:>6} {src:>18} -> {dst:<18} exact={exact(value)}  4dp={half_even(value, 4)}  2dp={half_even(value, 2)}")
    for case, price, per, to in PRICE_CASES:
        value = Fraction(price) * AREA[to] / AREA[per]
        print(f"{case:24} R$ {price:>7} per {per:>18} -> per {to:<18} exact={exact(value)}  2dp={half_even(value, 2)}")
    # Dimensions in braças must reproduce each area exactly.
    for u in catalog["units"]:
        if "dims" in u:
            a, b = u["dims"]
            assert a * b * BRACA * BRACA == AREA[u["id"]], u["id"]
    print("dims OK")
