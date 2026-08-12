import KeywordsManager from "./KeywordsManager";
import PolicyLists from "./PolicyLists";
import { Row, ContactLine } from "./ui";
import { Back, ChevronDown, Close, Desktop, Grid, Menu, Mobile } from "./icons";

const NAV = ["Dashboard", "Partner Alerts", "Alerts", "Policies", "Email Templates"];

const SEARCH_ENGINES = [
  "Google",
  "Yahoo",
  "Bing",
  "AOL",
  "Baidu",
  "Sogou",
  "Yandex",
  "Naver",
  "Haosou",
];

function CheckTile({ label, devices = false }: { label: string; devices?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-[10px] rounded-[2px] bg-field-alt p-[10px]">
      <div className="flex items-center gap-[10px]">
        <span className="size-[13px] rounded-[2.5px] border border-[#767676] bg-white" />
        <span className="text-[12px] text-black">{label}</span>
      </div>
      <div className="flex items-center gap-[4px] text-black/55">
        {devices ? (
          <>
            <Mobile className="size-[15px]" />
            <Desktop className="size-[15px]" />
          </>
        ) : (
          <Desktop className="size-[15px]" />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="flex h-[50px] items-center justify-between bg-header text-white">
        <div className="flex h-full items-center gap-[14px] bg-brand px-[12px]">
          <span className="font-display text-[18px] font-bold tracking-wide text-white">
            PROTECT
          </span>
          <Menu className="size-[20px]" />
        </div>
        <nav className="flex h-full">
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              className={`flex h-full items-center px-[15px] text-[13px] font-bold tracking-[0.325px] ${
                item === "Policies" ? "bg-header-active" : "hover:bg-header-active/60"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-[15px] pr-[20px]">
          <div className="flex items-center gap-[6px] text-[13px] font-bold">
            PZRetail Test (pzretail_product)
            <ChevronDown className="size-[18px]" />
          </div>
          <Grid className="size-[20px]" />
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-[1360px] px-[20px] py-[30px]">
        <h1 className="font-display text-[18px] font-bold text-black">Create Policy</h1>

        <a
          href="#"
          className="mt-[16px] inline-flex items-center gap-[4px] text-[12px] text-muted hover:underline"
        >
          <Back className="size-[15px]" />
          Back to policy list
        </a>

        <form className="mt-[20px] rounded-[2px] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <div className="px-[30px] py-[15px]">
            <Row label="Name">
              <input
                placeholder="Name of policy..."
                className="min-h-[32px] w-full rounded-[6px] bg-field px-[10px] py-[9px] text-[12px] text-black outline-none placeholder:italic placeholder:text-black/50 focus:ring-2 focus:ring-save/40"
              />
            </Row>

            <Row label="Device types">
              <div className="flex flex-wrap gap-[10px]">
                <CheckTile label="Desktop" />
                <CheckTile label="Mobile" />
              </div>
            </Row>

            <Row label="Search frequencies">
              <div className="flex flex-col gap-[10px]">
                <div className="relative inline-flex w-fit items-center rounded-[6px] bg-field">
                  <span className="min-w-[100px] px-[8px] py-[7px] pr-[34px] text-[12px] text-black">
                    Every 24 Hours
                  </span>
                  <ChevronDown className="pointer-events-none absolute right-[8px] size-[15px] text-black/60" />
                </div>
                <ContactLine>Want to monitor more often?</ContactLine>
              </div>
            </Row>

            <Row label="Search engines" alignTop>
              <div className="flex flex-col gap-[10px]">
                <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4">
                  {SEARCH_ENGINES.map((name) => (
                    <CheckTile key={name} label={name} devices />
                  ))}
                </div>
                <ContactLine>
                  Up to 3 search engines can be added with your plan. Contact our sales team to
                  upgrade to add more search engines.
                </ContactLine>
              </div>
            </Row>

            <Row
              label="Locations"
              alignTop
              description="Add locations you'd like to monitor. The total daily searches for each keyword will be divided between the selected locations within the policy."
            >
              <div className="flex flex-col gap-[10px]">
                <div className="relative max-w-[664px] rounded-[6px] bg-field">
                  <span className="block px-[8px] py-[9px] pr-[34px] text-[12px] italic text-black/50">
                    Add countries
                  </span>
                  <ChevronDown className="pointer-events-none absolute right-[10px] top-1/2 size-[18px] -translate-y-1/2 text-black/60" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-[4px] rounded-[20px] bg-pill py-[4px] pl-[10px] pr-[6px] text-[12px] font-semibold text-black">
                    United States of America
                    <Close className="size-[14px] text-black/70" />
                  </span>
                </div>
                <ContactLine>
                  Up to 3 countries can be monitored with your plan. Contact our sales team to
                  upgrade to monitor more countries.
                </ContactLine>
              </div>
            </Row>

            {/* Keywords — the interactive piece */}
            <Row
              label="Keywords"
              alignTop
              description="Tell us what and where to search for initial collection of ads by adding keywords you would like to monitor."
            >
              <KeywordsManager />
            </Row>

            <PolicyLists />

            <div className="flex justify-end pt-[20px]">
              <button
                type="button"
                className="rounded-[6px] bg-save px-[16px] py-[8px] text-[12px] font-semibold text-white hover:bg-[#2b7de0]"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
