interface ProtocolJSON {
  contracts: Dictionary
  whitelist: Dictionary<ListedItem>
  delist: Dictionary<DelistItem>
  ibcList: Dictionary<IBCItem>
}
