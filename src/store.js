import create from 'zustand';

const useStore = create(set => ({
    
    // Wallet connection
    provider: null,
    signer: null,
    isWalletConnected: false,
    wallet: null,
    network: null,

    // Others
    pageSelected: 0,
    walletModalIsOpen: false,
    networkModalIsOpen: false,

    // Methods
    setProvider: (provider, signer, wallet, network) => set(() => ({
        provider: provider,
        signer: signer,
        wallet: wallet,
        network: network,
        isWalletConnected: (provider != null)
    })),
    setPageSelected: (page) => set(() => ({ pageSelected: page })),
    toggleNetworkModal: () => set(state => ({ networkModalIsOpen: !state.networkModalIsOpen })),
    toggleWalletModal: () => set(state => ({ walletModalIsOpen: !state.walletModalIsOpen })),
    
}));

export default useStore;