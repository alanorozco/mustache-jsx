<div>
  {view("foo")["bar"]}
  <div>{view("bar")["baz"]}</div>
  {section(view("foo"), (_0_foo, _i_0) => (
    <>
      <p>{view("bar", _0_foo)["baz"]}</p>
      {section(view("bar", _0_foo), (_1_bar, _i_1) => (
        <p>{view("x", _1_bar, _0_foo)["y"]["z"]}</p>
      ))}
    </>
  ))}{" "}
  {view("foo")["0"]["key"]}
</div>;
