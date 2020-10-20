<>
  <h1>{view("header")}</h1>
  {section(view("list"), (_0_list, _i_0) => (
    <ul>
      {section(view("item", _0_list), (_1_item, _i_1) => (
        <>
          {section(view("current", _1_item, _0_list), (_2_current, _i_2) => (
            <li>
              <strong>{view("name", _2_current, _1_item, _0_list)}</strong>
            </li>
          ))}
          {section(view("link", _1_item, _0_list), (_3_link, _i_3) => (
            <li>
              <a href={`${view("url", _3_link, _1_item, _0_list)}`}>
                {view("name", _3_link, _1_item, _0_list)}
              </a>
            </li>
          ))}
        </>
      ))}{" "}
    </ul>
  ))}
  {section(view("empty"), (_4_empty, _i_4) => (
    <p>The list is empty.</p>
  ))}
</>;
