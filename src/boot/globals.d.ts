declare var global: Global;
declare var window: Global;
declare var self: Global;
declare var tabris: ProtoTabris;
declare var document: PseudoHtmlDocument;
declare var console: ProtoConsole;

interface Global {
  global: this;
  window: this;
  self: this;
  tabris: ProtoTabris;
  document: PseudoHtmlDocument;
  debugClient: {
    start(module: import('./Module').default): void
  };
  module: import('./Module').default;
  require: import('./Module').default['require'];
  exports: import('./Module').default['exports'];
  workerScriptPath?: string;
  __dirname: string;
  __filename: string;
}

interface ProtoTabris {
  Module: typeof import('./Module').default;
  flush(): void;
  _start(client: PartialNativeClient): void;
  _client: PartialNativeClient;
  _entryPoint: null | ((cb: () => void) => void);
  _defineModule(id: string, fn: Function): import('./Module').default;
  _init(client: PartialNativeClient, options?: {headless: boolean}): void;
  _notify: (...args: any[]) => any;
}

interface ProtoConsole {
  print?: (level: string, message: string) => void;
  error?: (...args: any[]) => void;
}

type PartialNativeClient = {
  load(url: string): string,
  execute(code: string, url: string): LEResult,
  loadAndExecute(url: string, modulePrefix: string, modulePostfix: string): LEResult
};

type LEResult = {
  loadError?: true,
  executeResult: any
};

interface PseudoHTMLElement {
  appendChild(el: PseudoHTMLElement): void;
}

interface PseudoHtmlDocument extends PseudoHTMLElement {
  head: PseudoHTMLElement;
  createElement(name: string): PseudoHTMLElement & {src: string};
}

