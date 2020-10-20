section(view("foo"), (_0_foo, _i_0) => (
  <>
    <div>{view(null, _0_foo)}</div>
    {view("sub", _0_foo)}
    {section(view("nested", _0_foo), (_1_nested, _i_1) => (
      <b>{view(null, _1_nested, _0_foo)}</b>
    ))}
  </>
));
