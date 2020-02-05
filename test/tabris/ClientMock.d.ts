export default class ClientMock {

  constructor(defaults?: {[type: string]: {[prop: string]: any}});

  calls(): ClientCall[];
  calls(filter: Partial<ClientCreateCall>): ClientCreateCall[];
  calls(filter: Partial<ClientGetCall>): ClientGetCall[];
  calls(filter: Partial<ClientSetCall>): ClientSetCall[];
  calls(filter: Partial<ClientCallCall>): ClientCallCall[];
  calls(filter: Partial<ClientListenCall>): ClientListenCall[];
  calls(filter: Partial<ClientDestroyCall>): ClientDestroyCall[];

  resetCalls(): void;

  properties(cid: string): {[key: string]: any};

}

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
};

type ClientCallCall = {
  op: 'call',
  id: string,
  method: string,
  parameters: {[key: string]: any}
};

type ClientListenCall = {
  op: 'listen',
  id: string,
  event: string,
  listen: boolean
};

type ClientDestroyCall = {
  op: 'destroy',
  id: string
};

type ClientCall = {
  op: 'create' | 'set' | 'get' | 'listen' | 'call' | 'destroy',
  id: string,
  type: string,
  properties: {[key: string]: any},
  property: string,
  method: string,
  parameters: {[key: string]: any},
  event: string,
  listen: boolean
};
