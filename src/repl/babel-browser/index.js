const { transform, transformAsync } = require("@babel/core");
const babelPluginSyntaxJsx = require("@babel/plugin-syntax-jsx");
const babelPresetReact = require("@babel/preset-react");

self.__babel = {
  Babel: { transform, transformAsync },
  babelPluginSyntaxJsx,
  babelPresetReact,
};
