<>
  {section(view("foo"), (_0_foo, _i_0) => (
    <>
      <div>{view("bar", _0_foo)}</div>
      {section(view("baz", _0_foo), (_1_baz, _i_1) => (
        <>
          <b>Hola, {view("mundo", _1_baz, _0_foo)}</b>
        </>
      ))}
    </>
  ))}
</>;
