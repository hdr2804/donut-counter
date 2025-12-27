// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISwapRouter {
    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    function exactOutputSingle(ExactOutputSingleParams calldata params)
        external
        payable
        returns (uint256 amountIn);

    function refundETH() external;
}

contract DonutCounter {
    ISwapRouter public constant SWAP_ROUTER = ISwapRouter(0x2626664c2603336E57B271c5C0b26F421741e481); // Uniswap V3 Router Base
    address public constant DONUT_TOKEN = 0xae4a37d554c6d6f3e398546d8566b25052e0169c;
    address public constant WETH9 = 0x4200000000000000000000000000000000000006; // WETH Base

    mapping(address => uint256) public counts;

    /// @notice Tukar ETH untuk 1 Donut token
    function increment() external payable {
        require(msg.value > 0, "Send ETH");

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
            tokenIn: WETH9,
            tokenOut: DONUT_TOKEN,
            fee: 3000, // 0.3% pool
            recipient: msg.sender,
            deadline: block.timestamp,
            amountOut: 1e18, // 1 DONUT
            amountInMaximum: msg.value,
            sqrtPriceLimitX96: 0
        });

        // Kirim ETH ke router
        (bool success,) = address(SWAP_ROUTER).call{value: msg.value}(
            abi.encodeWithSelector(
                SWAP_ROUTER.exactOutputSingle.selector,
                params
            )
        );
        require(success, "Swap failed");

        // Kembalikan kelebihan ETH
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(msg.sender).transfer(balance);
        }

        counts[msg.sender] += 1;
    }

    receive() external payable {}
}
