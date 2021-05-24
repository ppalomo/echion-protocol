import create from 'zustand';

const useStore = create(set => ({
    
    // Wallet connection
    provider: null,
    signer: null,
    isWalletConnected: false,
    wallet: null,
    balance: 0,
    network: null,

    // Others
    pageSelected: 0,
    walletModalIsOpen: false,
    networkModalIsOpen: false,

    // Methods
    setProvider: (provider, signer, wallet, network, balance) => set(() => ({
        provider: provider,
        signer: signer,
        wallet: wallet,
        network: network,
        balance: balance,
        isWalletConnected: (provider != null)
    })),
    setBalance: (balance) => set(() => ({ balance: balance })),
    setPageSelected: (page) => set(() => ({ pageSelected: page })),
    toggleNetworkModal: () => set(state => ({ networkModalIsOpen: !state.networkModalIsOpen })),
    toggleWalletModal: () => set(state => ({ walletModalIsOpen: !state.walletModalIsOpen })),
    setWalletModal: (open) => set(state => ({ walletModalIsOpen: open })),
}));

export default useStore;