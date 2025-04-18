// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PaymentEscrow
 * @notice Ce contrat gère des fonds en stablecoins (ex. USDC) déposés en escrow et les libère selon des conditions prédéfinies.
 */
contract PaymentEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    address public owner;
    IERC20 public stablecoin;

    event PaymentEscrowed(address indexed payer, uint256 amount);
    event PaymentReleased(address indexed recipient, uint256 amount);

    /**
     * @notice Le constructeur initialise le propriétaire du contrat et le token stablecoin.
     * @param _stablecoin L'adresse du token stablecoin (ex. USDC).
     */
    constructor(address _stablecoin) {
        owner = msg.sender;
        stablecoin = IERC20(_stablecoin);
    }

    /**
     * @notice Dépose des fonds en stablecoin dans le contrat.
     * Le payeur doit avoir préalablement approuvé le transfert.
     * @param amount Le montant à déposer.
     */
    function deposit(uint256 amount) external nonReentrant {
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        emit PaymentEscrowed(msg.sender, amount);
    }

    /**
     * @notice Libère des fonds vers un bénéficiaire.
     * Seul le propriétaire du contrat peut appeler cette fonction.
     * @param recipient L'adresse du bénéficiaire.
     * @param amount Le montant à libérer.
     */
    function releasePayment(address recipient, uint256 amount) external nonReentrant {
        require(msg.sender == owner, "Only owner can release payment");
        stablecoin.safeTransfer(recipient, amount);
        emit PaymentReleased(recipient, amount);
    }
}
