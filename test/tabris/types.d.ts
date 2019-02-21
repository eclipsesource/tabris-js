type ClientCreateCall = {
  op: 'create',
  id: string,
  type: string,
  properties: {[key: string]: any}
};

type ClientGetCall = {
  op: 'get',
  id: string,
  property: string
};

type ClientSetCall = {
  op: 'set',
  id: string,
  properties: {[key: string]: any}
}

type ClientCallCall = {
  op: 'call',
  id: string,
  method: string,
  parameters: {[key: string]: any}
}

type ClientListenCall = {
  op: 'listen',
  id: string,
  event: string,
  listen: {[key: string]: boolean}
}

type ClientListenCall = {
  op: 'destroy',
  id: string
}

type NativeCallFilter = Partial<ClientCreateCall | ClientGetCall | ClientSetCall | ClientCallCall | ClientListenCall | ClientListenCall>;
type NativeCallResult =
  Array<Partial<
    ClientCreateCall & ClientGetCall & ClientSetCall & ClientCallCall & ClientListenCall & ClientListenCall
  >>;