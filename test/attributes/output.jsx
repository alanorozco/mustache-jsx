<a
  href={view("href")}
  title={view("title")}
  aria-label={view("title")}
  alt={`foo bar`}
  data-json={`{&quot;json&quot;: &quot;${view("json")}&quot;}`}
  class={`c ${view("x")} ${section(
    view("classes"),
    (_0_classes, _i_0) => _0_classes
  ).join("")} ${inverted(view("bar")) ? "not-bar" : ""}`}
>
  {view("title")}
</a>;
