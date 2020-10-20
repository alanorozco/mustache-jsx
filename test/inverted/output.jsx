inverted(view("falsy")) ? (
  <ul>
    <li>{view(null)}</li>
    <li>{view("lookup")}</li>
  </ul>
) : (
  ""
);
