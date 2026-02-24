"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/plugin_registry.ts
  var plugin_registry_exports = {};
  __export(plugin_registry_exports, {
    isPluginEnabled: () => isPluginEnabled,
    plugins: () => plugins,
    registerPlugin: () => registerPlugin,
    restoreEnabledPlugins: () => restoreEnabledPlugins,
    saveEnabledPlugins: () => saveEnabledPlugins,
    setPluginEnabled: () => setPluginEnabled
  });
  var plugins = /* @__PURE__ */ Object.create(null);
  var enabledPlugins = /* @__PURE__ */ new Set();
  function registerPlugin(plugin) {
    if (plugin.name in plugins) {
      throw new Error(`Duplicate plugin: '${plugin.name}'`);
    }
    plugins[plugin.name] = plugin;
  }
  var ENABLED_STORAGE_KEY = "fluke_enabled_plugins";
  function isPluginEnabled(plugin) {
    return plugin.forceEnable || enabledPlugins.has(plugin.name);
  }
  function setPluginEnabled(plugin, enabled) {
    if (plugin.forceEnable) {
      return;
    }
    if (enabled) {
      enabledPlugins.add(plugin.name);
    } else {
      enabledPlugins.delete(plugin.name);
    }
  }
  function restoreEnabledPlugins() {
    const str = localStorage.getItem(ENABLED_STORAGE_KEY);
    if (str === null) {
      return;
    }
    try {
      var loaded = JSON.parse(str);
      if (!Array.isArray(loaded)) {
        console.warn(`${ENABLED_STORAGE_KEY} is not an array`);
        return;
      }
    } catch (err) {
      if (!(err instanceof SyntaxError)) {
        throw err;
      }
      console.warn("Failed to load ${ITEM_NAME}", err);
      return;
    }
    enabledPlugins.clear();
    for (const item of loaded) {
      if (typeof item !== "string") {
        console.warn(`Item in ${ENABLED_STORAGE_KEY} is not a string`, item);
        continue;
      }
      const plugin = plugins[item];
      if (plugin) {
        setPluginEnabled(plugin, true);
      }
    }
  }
  function saveEnabledPlugins() {
    localStorage.setItem(ENABLED_STORAGE_KEY, JSON.stringify([...enabledPlugins]));
  }

  // src/webpack.ts
  var webpack_exports = {};
  __export(webpack_exports, {
    React: () => React,
    mappedRequire: () => mappedRequire,
    patchWebpack: () => patchWebpack,
    reverseRequireMap: () => reverseRequireMap,
    wreq: () => wreq
  });
  var wreq;
  var React;
  var reverseRequireMap = /* @__PURE__ */ new Map();
  function mappedRequire(id) {
    return wreq(reverseRequireMap.get(id) ?? id);
  }
  var nodeModulePattern = /^\.\.\/node_modules\/\.pnpm\/.+?\/node_modules\/(.+?)$/;
  function mapID(id) {
    const srcPrefix = "./src/";
    if (id.startsWith(srcPrefix)) {
      return "fluxer_app/" + id.substring(srcPrefix.length);
    }
    const nodeModuleMatch = id.match(nodeModulePattern);
    if (nodeModuleMatch !== null) {
      return nodeModuleMatch[1];
    }
    return null;
  }
  function patchWebpack(require2, modules, patchModule2) {
    wreq = require2;
    const addModule = (id, value) => {
      const mappedID = mapID(id);
      if (mappedID !== null) {
        if (reverseRequireMap.has(mappedID)) {
          console.warn(`Multiple modules mapped to '${mappedID}' - '${reverseRequireMap.get(mappedID)}' and '${id}' conflicting`);
        } else {
          reverseRequireMap.set(mappedID, id);
        }
      }
      modules[id] = patchModule2(mappedID ?? id, value);
      if (mappedID === "react/index.js") {
        React = wreq(id);
      }
    };
    require2.m = new Proxy(modules, {
      set(_, id, newValue) {
        if (typeof id !== "string") {
          modules[id] = newValue;
        } else {
          addModule(id, newValue);
        }
        return true;
      }
    });
    for (const id in modules) {
      addModule(id, modules[id]);
    }
  }

  // src/plugin.ts
  function definePlugin(p) {
    return p;
  }

  // src/plugins/Test.ts
  var Test_default = definePlugin({
    name: "Test",
    description: "A test plugin",
    patches: [{
      module: "fluxer_app/index.tsx",
      replace: [{
        pattern: /"Fluxer"/,
        replacement: '"Fluke Skywalker"'
      }]
    }]
  });

  // src/lazy.ts
  function lazyLoad(load) {
    let value;
    return () => {
      if (value !== void 0) {
        return value;
      }
      value = load();
      return value;
    };
  }
  function lazyProxy(load) {
    const target = {};
    const lazyValue = () => {
      if ("value" in target) {
        return target.value;
      } else {
        const result = load();
        if (result == null) {
          throw new Error("load() returned nullish value");
        }
        if (typeof result !== "object") {
          throw new Error("load() returned non-object value '${typeof result}'");
        }
        target["value"] = result;
        return result;
      }
    };
    return new Proxy(target, {
      apply(_, thisArg, argArray) {
        return Reflect.apply(lazyValue(), thisArg, argArray);
      },
      construct(_, argArray, newTarget) {
        return Reflect.construct(lazyValue(), argArray, newTarget);
      },
      defineProperty(_, prop, attributes) {
        return Reflect.defineProperty(lazyValue(), prop, attributes);
      },
      deleteProperty(_, prop) {
        return Reflect.deleteProperty(lazyValue(), prop);
      },
      get(_, prop) {
        return Reflect.get(lazyValue(), prop);
      },
      getOwnPropertyDescriptor(_, prop) {
        return Reflect.getOwnPropertyDescriptor(lazyValue(), prop);
      },
      getPrototypeOf() {
        return Reflect.getPrototypeOf(lazyValue());
      },
      has(_, prop) {
        return Reflect.has(lazyValue(), prop);
      },
      isExtensible() {
        return Reflect.isExtensible(lazyValue());
      },
      ownKeys() {
        return Reflect.ownKeys(lazyValue());
      },
      preventExtensions() {
        return Reflect.preventExtensions(lazyValue());
      },
      set(_, prop, newValue) {
        return Reflect.set(lazyValue(), prop, newValue);
      },
      setPrototypeOf(_, value) {
        return Reflect.setPrototypeOf(lazyValue(), value);
      }
    });
  }

  // src/plugins/SettingsMenu/PluginsTab.tsx
  var Switch = lazyProxy(() => Object.values(mappedRequire("fluxer_app/components/form/Switch.tsx"))[0]);
  function PluginComponent({ plugin }) {
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
    let name = plugin.name;
    if (plugin.forceEnable) {
      name += " (Required)";
    }
    return /* @__PURE__ */ Fluke.webpack.React.createElement(
      Switch,
      {
        label: plugin.name,
        description: plugin.description,
        disabled: plugin.forceEnable,
        value: isPluginEnabled(plugin),
        onChange: (v) => {
          setPluginEnabled(plugin, v);
          saveEnabledPlugins();
          forceUpdate();
        }
      }
    );
  }
  function PluginsTab_default() {
    return /* @__PURE__ */ Fluke.webpack.React.createElement(Fluke.webpack.React.Fragment, null, Object.values(plugins).map((p) => /* @__PURE__ */ Fluke.webpack.React.createElement(PluginComponent, { plugin: p })));
  }

  // src/ui/icons/PlugIcon.tsx
  var IconBase = lazyProxy(() => mappedRequire("@phosphor-icons/react/dist/lib/IconBase.es.js").A);
  var weights = lazyLoad(() => /* @__PURE__ */ new Map([
    [
      "bold",
      /* @__PURE__ */ Fluke.webpack.React.createElement(Fluke.webpack.React.Fragment, null, /* @__PURE__ */ Fluke.webpack.React.createElement("path", { d: "M240.49,63.51a12,12,0,0,0-17,0L192,95,161,64l31.52-31.51a12,12,0,0,0-17-17L144,47,120.49,23.51a12,12,0,1,0-17,17L107,44,56.89,94.14a44,44,0,0,0,0,62.23l12.88,12.88L23.51,215.51a12,12,0,0,0,17,17l46.26-46.26,12.88,12.88a44,44,0,0,0,62.23,0L212,149l3.51,3.52a12,12,0,0,0,17-17L209,112l31.52-31.51A12,12,0,0,0,240.49,63.51Zm-95.6,118.63a20,20,0,0,1-28.29,0L73.86,139.4a20,20,0,0,1,0-28.29L124,61l71,71Z" }))
    ],
    [
      "duotone",
      /* @__PURE__ */ Fluke.webpack.React.createElement(Fluke.webpack.React.Fragment, null, /* @__PURE__ */ Fluke.webpack.React.createElement(
        "path",
        {
          d: "M212,132l-58.63,58.63a32,32,0,0,1-45.25,0L65.37,147.88a32,32,0,0,1,0-45.25L124,44Z",
          opacity: "0.2"
        }
      ), /* @__PURE__ */ Fluke.webpack.React.createElement("path", { d: "M237.66,66.34a8,8,0,0,0-11.32,0L192,100.69,155.31,64l34.35-34.34a8,8,0,1,0-11.32-11.32L144,52.69,117.66,26.34a8,8,0,0,0-11.32,11.32L112.69,44l-53,53a40,40,0,0,0,0,56.57l15.71,15.71L26.34,218.34a8,8,0,0,0,11.32,11.32l49.09-49.09,15.71,15.71a40,40,0,0,0,56.57,0l53-53,6.34,6.35a8,8,0,0,0,11.32-11.32L203.31,112l34.35-34.34A8,8,0,0,0,237.66,66.34ZM147.72,185a24,24,0,0,1-33.95,0L71,142.23a24,24,0,0,1,0-33.95l53-53L200.69,132Z" }))
    ],
    [
      "fill",
      /* @__PURE__ */ Fluke.webpack.React.createElement(Fluke.webpack.React.Fragment, null, /* @__PURE__ */ Fluke.webpack.React.createElement("path", { d: "M237.66,77.66,203.31,112l26.35,26.34a8,8,0,0,1-11.32,11.32L212,143.31l-53,53a40,40,0,0,1-56.57,0L86.75,180.57,37.66,229.66a8,8,0,0,1-11.32-11.32l49.09-49.09L59.72,153.54a40,40,0,0,1,0-56.57l53-53-6.35-6.34a8,8,0,0,1,11.32-11.32L144,52.69l34.34-34.35a8,8,0,1,1,11.32,11.32L155.31,64,192,100.69l34.34-34.35a8,8,0,0,1,11.32,11.32Z" }))
    ],
    [
      "light",
      /* @__PURE__ */ Fluke.webpack.React.createElement(Fluke.webpack.React.Fragment, null, /* @__PURE__ */ Fluke.webpack.React.createElement("path", { d: "M236.24,67.76a6,6,0,0,0-8.48,0L192,103.51,152.49,64l35.75-35.76a6,6,0,0,0-8.48-8.48L144,55.51,116.24,27.76a6,6,0,1,0-8.48,8.48L115.51,44,61.13,98.38a38,38,0,0,0,0,53.75l17.13,17.12-50.5,50.51a6,6,0,1,0,8.48,8.48l50.51-50.5,17.13,17.13a38,38,0,0,0,53.74,0L212,140.49l7.76,7.75a6,6,0,0,0,8.48-8.48L200.49,112l35.75-35.76A6,6,0,0,0,236.24,67.76ZM149.13,186.38a26,26,0,0,1-36.77,0L69.62,143.64a26,26,0,0,1,0-36.77L124,52.49,203.51,132Z" }))
    ],
    [
      "regular",
      /* @__PURE__ */ Fluke.webpack.React.createElement(Fluke.webpack.React.Fragment, null, /* @__PURE__ */ Fluke.webpack.React.createElement("path", { d: "M237.66,66.34a8,8,0,0,0-11.32,0L192,100.69,155.31,64l34.35-34.34a8,8,0,1,0-11.32-11.32L144,52.69,117.66,26.34a8,8,0,0,0-11.32,11.32L112.69,44l-53,53a40,40,0,0,0,0,56.57l15.71,15.71L26.34,218.34a8,8,0,0,0,11.32,11.32l49.09-49.09,15.71,15.71a40,40,0,0,0,56.57,0l53-53,6.34,6.35a8,8,0,0,0,11.32-11.32L203.31,112l34.35-34.34A8,8,0,0,0,237.66,66.34ZM147.72,185a24,24,0,0,1-33.95,0L71,142.23a24,24,0,0,1,0-33.95l53-53L200.69,132Z" }))
    ],
    [
      "thin",
      /* @__PURE__ */ Fluke.webpack.React.createElement(Fluke.webpack.React.Fragment, null, /* @__PURE__ */ Fluke.webpack.React.createElement("path", { d: "M234.83,69.17a4,4,0,0,0-5.66,0L192,106.34,149.66,64l37.17-37.17a4,4,0,1,0-5.66-5.66L144,58.34,114.83,29.17a4,4,0,0,0-5.66,5.66L118.34,44,62.54,99.8a36.05,36.05,0,0,0,0,50.91l18.55,18.54L29.17,221.17a4,4,0,0,0,5.66,5.66l51.92-51.92,18.54,18.55a36.06,36.06,0,0,0,50.91,0l55.8-55.8,9.17,9.17a4,4,0,0,0,5.66-5.66L197.66,112l37.17-37.17A4,4,0,0,0,234.83,69.17ZM150.54,187.8a28,28,0,0,1-39.59,0L68.2,145.05a28,28,0,0,1,0-39.59L124,49.66,206.34,132Z" }))
    ]
  ]));
  function PlugIcon_default(props) {
    return /* @__PURE__ */ Fluke.webpack.React.createElement(IconBase, { ...props, weights: weights() });
  }

  // src/plugins/SettingsMenu/index.ts
  var SettingsMenu_default = definePlugin({
    name: "SettingsMenu",
    description: "Adds Fluke settings to Fluxer.",
    forceEnable: true,
    patches: [
      {
        module: "fluxer_app/components/modals/utils/SettingsConstants.tsx",
        replace: [
          {
            pattern: /{type:"developer_options",category:"staff_only"/,
            replacement: "...$this.sections(),$&"
          },
          {
            pattern: /(?<=function \i\(\i\)\{switch\(\i\)\{)case"user_settings"/,
            replacement: "default:return $this.categoryName(arguments[0]);$&"
          }
        ]
      },
      {
        module: "fluxer_app/components/modals/UserSettingsModal.tsx",
        replace: [
          {
            pattern: /(?<=(?<tabName>\i)=>\{var \i;return )null!=\(\i=\i\[\i\]\)\?\i:null/,
            replacement: "$this.tabComponent($<tabName>)??($&);"
          }
        ]
      }
    ],
    sections() {
      return [{
        type: "fluke_plugins",
        category: "fluke",
        "label": { "message": "Plugins" },
        icon: PlugIcon_default
      }];
    },
    tabComponent(id) {
      switch (id) {
        case "fluke_plugins":
          return PluginsTab_default;
      }
    },
    categoryName(id) {
      switch (id) {
        case "fluke":
          return "Fluke";
      }
    }
  });

  // src/plugins/index.ts
  function registerPlugins() {
    registerPlugin(SettingsMenu_default);
    registerPlugin(Test_default);
  }

  // src/loader.ts
  window["Fluke"] = { pluginRegistry: plugin_registry_exports, webpack: webpack_exports };
  registerPlugins();
  restoreEnabledPlugins();
  var replaceByModule = /* @__PURE__ */ new Map();
  for (const name in plugins) {
    const plugin = plugins[name];
    if (!isPluginEnabled(plugin)) {
      continue;
    }
    for (const patch of plugin.patches) {
      let modEntry = replaceByModule.get(patch.module);
      if (!modEntry) {
        modEntry = [];
        replaceByModule.set(patch.module, modEntry);
      }
      for (const replace of patch.replace) {
        const newSource = replace.pattern.source.replaceAll(
          "\\i",
          "(?:[A-Za-z$_][A-Za-z$_0-9]*)"
        );
        replace.pattern = new RegExp(newSource, replace.pattern.flags);
        replace.replacement = replace.replacement.replaceAll(
          "$this",
          "Fluke.pluginRegistry.plugins[" + JSON.stringify(plugin.name) + "]"
        );
      }
      modEntry.push(...patch.replace);
    }
  }
  function patchModule(key, value) {
    const modReplaces = replaceByModule.get(key);
    let src = Function.prototype.toString.call(value);
    if (modReplaces) {
      for (const replace of modReplaces) {
        let newSrc;
        if (replace.pattern.flags.includes("g")) {
          newSrc = src.replaceAll(replace.pattern, replace.replacement);
        } else {
          newSrc = src.replace(replace.pattern, replace.replacement);
        }
        if (src === newSrc) {
          console.warn("Patch had no effect", replace);
        } else {
          src = newSrc;
        }
      }
    }
    src = `//# sourceURL=file:///fluke_patched/${key}
0,${src}`;
    return (0, eval)(src);
  }
  Object.defineProperty(Function.prototype, "m", {
    set(modules) {
      delete Function.prototype["m"];
      patchWebpack(this, modules, patchModule);
    },
    configurable: true
  });
})();
