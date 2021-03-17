export const replaceDoubleUnderscore = (str, replacements) =>
  str.replace(/__([a-z]\w*)/gi, (match, key) => replacements[key] ?? match);
