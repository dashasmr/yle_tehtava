import { useState, useEffect } from "react";

// Ylen brändivärit vakioina
const YLE_TURKOOSI = "#00b4c8";
const YLE_HARMAA = "#bbbcbc";

function App() {
  const [data, setData] = useState([]);
  const [kunta, setKunta] = useState("");
  const [tulos, setTulos] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Haetaan Tilastokeskuksen CSV ja parsitaan se
  useEffect(() => {
    fetch("data.csv")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        // ISO-8859-1 → oikeat skandit
        const text = new TextDecoder("iso-8859-1").decode(buffer);
        const lines = text.split(/\r?\n/);

        const headerIndex = lines.findIndex((line) =>
          line.trim().startsWith('"Vuosi"')
        );
        if (headerIndex === -1) {
          console.error("Otsikkoriviä ei löytynyt CSV:stä");
          return;
        }

        const dataLines = lines
          .slice(headerIndex + 1)
          .map((l) => l.trim())
          .filter((l) => l !== "");

        const parsed = dataLines
          .map((line) => {
            const vals = line.split(";");
            if (vals.length < 5) return null;

            const year = vals[0].replace(/"/g, "").trim();
            const area = vals[1].replace(/"/g, "").trim();
            const age = vals[2].replace(/"/g, "").trim();
            const total = vals[3].replace(/"/g, "").replace(/\s/g, "").trim();
            const foreign = vals[4].replace(/"/g, "").replace(/\s/g, "").trim();

            return {
              Vuosi: parseInt(year, 10),
              Alue: area,
              Ikä: age,
              Yhteensä: parseInt(total, 10) || 0,
              Vieraskieliset: parseInt(foreign, 10) || 0,
            };
          })
          .filter(Boolean)
          .filter((item) => item.Vuosi === 2024)
          .filter((item) => item.Ikä.toLowerCase().includes("yhteens"));

        parsed.sort((a, b) =>
          a.Alue.localeCompare(b.Alue, "fi", { sensitivity: "base" })
        );

        setData(parsed);
      })
      .catch((err) => console.error("Datan haku epäonnistui:", err));
  }, []);

  // Varsinainen haku (tarkka kuntanimi)
  function haeKunta() {
    const search = kunta.trim().toLowerCase();
    if (!search) {
      setTulos(null);
      setHasSearched(false);
      return;
    }

    const result = data.find(
      (item) => item.Alue.trim().toLowerCase() === search
    );

    setTulos(result || null);
    setHasSearched(true);
  }

  const kokoMaaData = data.find((item) => item.Alue === "KOKO MAA");

  const prosentti = tulos
    ? ((tulos.Vieraskieliset / tulos.Yhteensä) * 100).toFixed(1)
    : null;

  const kokoMaaProsentti =
    kokoMaaData &&
    ((kokoMaaData.Vieraskieliset / kokoMaaData.Yhteensä) * 100).toFixed(1);

  // Autocomplete-ehdotukset
  const searchLower = kunta.trim().toLowerCase();
  const suggestions = data.filter((item) =>
    item.Alue.trim().toLowerCase().includes(searchLower)
  );

  function handleSelectKunta(selected) {
    setKunta(selected.Alue);
    setTulos(selected);
    setHasSearched(true);
    setShowSuggestions(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "#f5f5f5",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: "14px",
        color: "#222",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          background: YLE_TURKOOSI,
          color: "white",
          padding: "0.8rem 1.2rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "18px",
            letterSpacing: "0.03em",
          }}
        >
          Vieraskieliset varhaiskasvatuksessa
        </h1>
      </header>

      <main
        style={{
          flex: 1,
          width: "100%",
          boxSizing: "border-box",
          margin: "1rem 0 0 0",
          padding: "1rem 1.2rem",
          background: "white",
          borderRadius: 0,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          borderTop: `1px solid ${YLE_HARMAA}`,
        }}
      >
        <p style={{ marginTop: 0, marginBottom: "0.8rem", color: "#555" }}>
          Hae oma kunta ja katso, kuinka suuri osa varhaiskasvatuksen lapsista
          on vieraskielisiä. Tiedot perustuvat Tilastokeskuksen tilastoon
          (vuosi 2024).
        </p>

        {/* Haku + autocomplete */}
        <div style={{ position: "relative", maxWidth: "360px" }}>
          <label
            htmlFor="kunta-input"
            style={{
              display: "block",
              fontSize: "12px",
              marginBottom: "0.25rem",
              color: "#444",
            }}
          >
            Kunta
          </label>
          <input
            id="kunta-input"
            type="text"
            value={kunta}
            onChange={(e) => {
              setKunta(e.target.value);
              setHasSearched(false);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                haeKunta();
                setShowSuggestions(false);
              }
            }}
            placeholder="Esim. Helsinki"
            style={{
              padding: "0.45rem 0.6rem",
              width: "100%",
              borderRadius: "4px",
              border: `1px solid ${YLE_HARMAA}`,
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => {
              haeKunta();
              setShowSuggestions(false);
            }}
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 1.1rem",
              borderRadius: "4px",
              border: "none",
              background: YLE_TURKOOSI,
              color: "white",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Hae
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "3.2rem",
                left: 0,
                right: 0,
                maxHeight: "220px",
                overflowY: "auto",
                background: "white",
                border: `1px solid ${YLE_HARMAA}`,
                borderRadius: "4px",
                listStyle: "none",
                margin: 0,
                padding: 0,
                zIndex: 10,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              {suggestions.map((item) => (
                <li
                  key={item.Alue}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectKunta(item);
                  }}
                  style={{
                    padding: "0.35rem 0.6rem",
                    cursor: "pointer",
                    fontSize: "13px",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0fafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  {item.Alue}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Kunnan tulos */}
        {tulos && (
          <section
            style={{
              marginTop: "1.4rem",
              padding: "0.8rem 0.9rem",
              borderRadius: "6px",
              border: `1px solid ${YLE_TURKOOSI}`,
              background: "#f0fbfd",
            }}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: "0.4rem",
                fontSize: "15px",
                color: "#004b54",
              }}
            >
              {tulos.Alue}
            </h2>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              Varhaiskasvatukseen osallistui yhteensä{" "}
              <strong>{tulos.Yhteensä.toLocaleString("fi-FI")}</strong> lasta,
              joista{" "}
              <strong>{tulos.Vieraskieliset.toLocaleString("fi-FI")}</strong>{" "}
              oli vieraskielisiä (
              <strong>{isFinite(prosentti) ? prosentti : "0.0"}%</strong>).
            </p>
          </section>
        )}

        {/* Koko maan vertailu */}
        {tulos && kokoMaaData && (
          <section
            style={{
              marginTop: "1rem",
              paddingTop: "0.8rem",
              borderTop: `1px solid ${YLE_HARMAA}`,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: "0.3rem",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#555",
              }}
            >
              Vertailu: koko maa
            </h3>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              Koko maassa varhaiskasvatukseen osallistui{" "}
              <strong>{kokoMaaData.Yhteensä.toLocaleString("fi-FI")}</strong>{" "}
              lasta, joista{" "}
              <strong>
                {kokoMaaData.Vieraskieliset.toLocaleString("fi-FI")}
              </strong>{" "}
              oli vieraskielisiä (
              <strong>
                {isFinite(kokoMaaProsentti) ? kokoMaaProsentti : "0.0"}%
              </strong>
              ).
            </p>
          </section>
        )}

        {/* Virheilmoitus, jos haku ei löytänyt kuntaa */}
        {!tulos && hasSearched && (
          <p
            style={{
              marginTop: "1rem",
              color: "#b00020",
              fontSize: "13px",
            }}
          >
            Kuntaa "{kunta}" ei löytynyt (tarkista kirjoitusasu).
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
