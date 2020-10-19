<>
  <div>
    {view("foo").bar}
    <div>{view("bar").baz}</div>
    {section(view("foo"), (_0_foo, _i_0) => (
      <>
        {" "}
        <p>{view("bar", _0_foo).baz}</p>
      </>
    ))}
  </div>
</>;
