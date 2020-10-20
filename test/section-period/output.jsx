section(view("foo"), (_0_foo, _i_0) => (
  <>
    <div>{_0_foo}</div>
    {view("sub", _0_foo)}
    {section(view("nested", _0_foo), (_1_nested, _i_1) => (
      <b>{_1_nested}</b>
    ))}
  </>
));
