import create from 'zustand';

const useStore = create(set => ({
    
    // Wallet connection
    provider: null,
    signer: null,
    isWalletConnected: false,
    wallet: null,
    balance: 0,
    network: null,
    coin: null,

    // Others
    pageSelected: 0,
    walletModalIsOpen: false,
    networkModalIsOpen: false,

    // App variables
    numberOfActiveLotteries: 0,
    totalBalance: 0,

    // Methods
    setProvider: (provider, signer, wallet, network, balance, coin) => set(() => ({
        provider: provider,
        signer: signer,
        wallet: wallet,
        network: network,
        balance: balance,
        isWalletConnected: (signer != null),
        coin: coin
    })),
    setBalance: (balance) => set(() => ({ balance: balance })),
    setNetwork: (network) => set(() => ({ network: network })),
    setPageSelected: (page) => set(() => ({ pageSelected: page })),
    toggleNetworkModal: () => set(state => ({ networkModalIsOpen: !state.networkModalIsOpen })),
    toggleWalletModal: () => set(state => ({ walletModalIsOpen: !state.walletModalIsOpen })),
    setWalletModal: (open) => set(state => ({ walletModalIsOpen: open })),

    setNumberOfActiveLotteries: (num) => set(() => ({ numberOfActiveLotteries: num })),
    setTotalBalance: (num) => set(() => ({ totalBalance: num })),
}));

export default useStore;