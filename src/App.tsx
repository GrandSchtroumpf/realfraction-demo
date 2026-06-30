import { useId, useState } from "react";
import "./App.css";

const data = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.42,
    price: 107523,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 2.35,
    price: 3550,
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: 18,
    price: 188,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: 1500,
    price: 1,
  },
];

const sortLabels = {
  asc: "Ascending",
  desc: "Descending",
};
type Sort = keyof typeof sortLabels;

const balanceFormatter = new Intl.NumberFormat("en-EN");
const formatBalance = (balance: number) => balanceFormatter.format(balance);
const priceFormatter = new Intl.NumberFormat("en-EN", {
  style: "currency",
  currency: "USD",
});
const formatPrice = (price: number) => priceFormatter.format(price);

const initSort = () => (localStorage.getItem("sort") as Sort | null) ?? "asc";

function App() {
  const searchId = useId();
  const sortId = useId();
  const searchLabelId = useId();

  const [list] = useState(structuredClone(data));
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">(initSort());

  const terms = search
    .split(/[\s,&]+/) // split by whitespace, commas, & (add more if needed)
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length > 0);

  // No need to useMemo because of compiler
  const filtered = list.filter((item) => {
    if (!terms.length) return true;
    return terms.some((term) => {
      if (item.name.toLowerCase().includes(term)) return true;
      if (item.symbol.toLowerCase().includes(term)) return true;
      return false;
    });
  });

  const sorted = [...filtered].sort((a, b) => {
    const delta = a.price - b.price;
    return sort === "asc" ? delta : delta * -1;
  });

  const totalFiat = list.reduce(
    (acc, item) => acc + item.balance * item.price,
    0,
  );

  const totalSearch = filtered.reduce(
    (acc, item) => acc + item.balance * item.price,
    0,
  );

  // No need to useCallback because of compiler
  const updateSort = (sort: Sort) => {
    setSort(sort);
    localStorage.setItem("sort", sort);
  };

  return (
    <div id="dashboard-page">
      <header className="main-header">
        <h1>All your assets in one place</h1>
        <div className="total-liquidity">
          <span>Total Budget</span>
          <span className="price">{formatPrice(totalFiat)}</span>
        </div>
      </header>
      <main>
        <search>
          <svg
            className="prefix"
            aria-hidden
            width="24"
            height="24"
            viewBox="0 -960 960 960"
            fill="currentColor"
          >
            <path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"></path>
          </svg>
          <label className="search-label" htmlFor={searchId}>
            <span id={searchLabelId}>Search by name or symbol</span>
          </label>
          <input
            id={searchId}
            type="search"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="BTC & SOL"
          />
          <button
            type="button"
            popoverTarget={sortId}
            aria-label="Sort items"
            className="btn icon menu-trigger"
          >
            <svg
              aria-label={sortLabels[sort]}
              height="24px"
              width="24px"
              viewBox="0 -960 960 960"
              fill="currentColor"
            >
              <path d="M 220 -360 V -540 H 160 V -600 H 280 V -360 H 220 Z M 360 -360 V -460 Q 360 -477 371.5 -488.5 T 400 -500 H 480 V -540 H 360 V -600 H 500 Q 517 -600 528.5 -588.5 T 540 -560 V -500 Q 540 -483 528.5 -471.5 T 500 -460 H 420 V -420 H 540 V -360 H 360 Z M 600 -360 V -420 H 720 V -460 H 640 V -500 H 720 V -540 H 600 V -600 H 740 Q 757 -600 768.5 -588.5 T 780 -560 V -400 Q 780 -383 768.5 -371.5 T 740 -360 H 600 Z" />
              {sort === "asc" ? (
                <path d="M 360 -760 L 480 -880 L 600 -760 H 360 Z" />
              ) : (
                <path d="M 480 -80 L 360 -200 H 600 L 480 -80 Z" />
              )}
            </svg>
          </button>
          <div id={sortId} popover="auto" className="menu">
            <div className="radio-group" role="radiogroup">
              <label htmlFor="sort-asc" className="radio">
                <input
                  id="sort-asc"
                  type="radio"
                  name="sort"
                  checked={sort === "asc"}
                  onClick={() => updateSort("asc")}
                />
                Ascending
              </label>
              <label htmlFor="sort-desc" className="radio">
                <input
                  id="sort-desc"
                  type="radio"
                  name="sort"
                  checked={sort === "desc"}
                  onClick={() => updateSort("desc")}
                />
                Descending
              </label>
            </div>
          </div>
        </search>
        {/* Table for desktop */}
        <table className="table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Balance</th>
              <th>Allocation</th>
              <th>Price in Fiat</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => {
              const fiat = item.price * item.balance;
              const percent = Math.round((fiat / totalFiat) * 100);
              return (
                <tr key={item.symbol}>
                  <td>{item.symbol}</td>
                  <td>{item.name}</td>
                  <td>{formatBalance(item.balance)}</td>
                  <td>{percent}%</td>
                  <td className="total">
                    <div className="total">
                      <b aria-description="Total price">
                        {formatPrice(item.price * item.balance)}
                      </b>
                      <small aria-description="Price per unit">
                        {formatPrice(item.price)}/{item.symbol}
                      </small>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>
                <div className="total-search">
                  <p>Total</p>
                  <b>{formatPrice(totalSearch)}</b>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="table-empty">
          <p>No results found.</p>
        </div>
        {/* List for mobile */}
        <dl>
          <div className="total-search">
            <dt>Total:</dt>
            <dd>{formatPrice(totalSearch)}</dd>
          </div>
          <dt className="invisible">My assets</dt>
          <dd>
            <ul>
              {sorted.map((item) => {
                const fiat = item.price * item.balance;
                const percent = Math.round((fiat / totalFiat) * 100);
                return (
                  <li key={item.symbol}>
                    <h3>{item.name}</h3>
                    <p className="balance">
                      {formatBalance(item.balance)} {item.symbol}
                    </p>
                    <p>{percent}%</p>
                    <p className="total">
                      <b aria-description="Total price">{formatPrice(fiat)}</b>
                      <small aria-description="Price per unit">
                        {formatPrice(item.price)}/{item.symbol}
                      </small>
                    </p>
                  </li>
                );
              })}
            </ul>
          </dd>
        </dl>
        <div className="list-empty">
          <p>No results found.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
