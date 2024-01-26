export const expectedWinningArray = [
    {
        address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        type: "0",
        scType: 0n,
        ticketId: 1,
        verifiedRoot: "0x125b8efbc5b81338d7f8807c5de7a3b39997f1049e08673088d2af77f87c93fb",
    },
    {
        address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
        type: "0",
        scType: 0n,
        ticketId: 8,
        verifiedRoot: "0x125b8efbc5b81338d7f8807c5de7a3b39997f1049e08673088d2af77f87c93fb",
    },
    {
        address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        type: "1",
        scType: 1n,
        ticketId: 5,
        verifiedRoot: "0xf3b224496df358c0b61bc78fcc2d262a3b042dfc3270c63768d53aa81379e04f",
    },
    {
        address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
        type: "1",
        scType: 1n,
        ticketId: 6,
        verifiedRoot: "0xf3b224496df358c0b61bc78fcc2d262a3b042dfc3270c63768d53aa81379e04f",
    },
    {
        address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        type: "1",
        scType: 1n,
        ticketId: 7,
        verifiedRoot: "0xf3b224496df358c0b61bc78fcc2d262a3b042dfc3270c63768d53aa81379e04f",
    },
    {
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        type: "2",
        scType: 2n,
        ticketId: 2,
        verifiedRoot: "0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94",
    },
    {
        address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        type: "3",
        scType: 3n,
        ticketId: 3,
        verifiedRoot: "0x1ebaa930b8e9130423c183bf38b0564b0103180b7dad301013b18e59880541ae",
    },
    {
        address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        type: "4",
        scType: 4n,
        ticketId: 4,
        verifiedRoot: "0xf4ca8532861558e29f9858a3804245bb30f0303cc71e4192e41546237b6ce58b",
    },
]

export const winnersArray = [
    {
        ticketId: 1,
        winner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        winningType: 0,
    },
    {
        ticketId: 2,
        winner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        winningType: 2,
    },
    {
        ticketId: 3,
        winner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        winningType: 3,
    },
    {
        ticketId: 4,
        winner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        winningType: 4,
    },
    {
        ticketId: 5,
        winner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        winningType: 1,
    },
    {
        ticketId: 6,
        winner: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
        winningType: 1,
    },
    {
        ticketId: 7,
        winner: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        winningType: 1,
    },
    {
        ticketId: 8,
        winner: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
        winningType: 0,
    },
]

export const groupedWinners = {
    "0": [
        {
            ticketId: 1,
            winner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            winningType: 0,
        },
        {
            ticketId: 8,
            winner: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
            winningType: 0,
        },
    ],
    "1": [
        {
            ticketId: 5,
            winner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
            winningType: 1,
        },
        {
            ticketId: 6,
            winner: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
            winningType: 1,
        },
        {
            ticketId: 7,
            winner: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
            winningType: 1,
        },
    ],
    "2": [
        {
            ticketId: 2,
            winner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            winningType: 2,
        },
    ],
    "3": [
        {
            ticketId: 3,
            winner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            winningType: 3,
        },
    ],
    "4": [
        {
            ticketId: 4,
            winner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            winningType: 4,
        },
    ],
}
