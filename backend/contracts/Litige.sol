// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Litige
 * @notice Ce contrat gère la résolution décentralisée des litiges via un système de vote.
 */
contract Litige is AccessControl {
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    enum DisputeOutcome { Pending, RefundBuyer, ReleaseFunds }
    
    struct Dispute {
        address initiator;
        uint256 agreementId;
        DisputeOutcome outcome;
        uint256 votesRefund;
        uint256 votesRelease;
        bool resolved;
        mapping(address => bool) hasVoted;
    }

    uint256 public disputeCount;
    mapping(uint256 => Dispute) public disputes;

    event DisputeInitiated(uint256 disputeId, address initiator, uint256 agreementId);
    event VoteCast(uint256 disputeId, address voter, DisputeOutcome vote);
    event DisputeResolved(uint256 disputeId, DisputeOutcome outcome);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARBITER_ROLE, msg.sender);
    }

    /**
     * @notice Initie un nouveau litige pour un accord donné.
     * @param agreementId L'identifiant de l'accord concerné.
     */
    function initiateDispute(uint256 agreementId) external returns (uint256) {
        disputeCount++;
        Dispute storage d = disputes[disputeCount];
        d.initiator = msg.sender;
        d.agreementId = agreementId;
        d.outcome = DisputeOutcome.Pending;
        d.resolved = false;
        emit DisputeInitiated(disputeCount, msg.sender, agreementId);
        return disputeCount;
    }

    /**
     * @notice Permet aux arbitres de voter sur un litige.
     * @param disputeId L'identifiant du litige.
     * @param voteOutcome Le vote (RefundBuyer ou ReleaseFunds).
     */
    function voteOnDispute(uint256 disputeId, DisputeOutcome voteOutcome) external onlyRole(ARBITER_ROLE) {
        Dispute storage d = disputes[disputeId];
        require(!d.resolved, "Dispute already resolved");
        require(!d.hasVoted[msg.sender], "Already voted");
        d.hasVoted[msg.sender] = true;
        if (voteOutcome == DisputeOutcome.RefundBuyer) {
            d.votesRefund++;
        } else if (voteOutcome == DisputeOutcome.ReleaseFunds) {
            d.votesRelease++;
        }
        emit VoteCast(disputeId, msg.sender, voteOutcome);
    }

    /**
     * @notice Finalise le litige en fonction de la majorité des votes.
     * @param disputeId L'identifiant du litige.
     */
    function finalizeDispute(uint256 disputeId) external onlyRole(ARBITER_ROLE) {
        Dispute storage d = disputes[disputeId];
        require(!d.resolved, "Already resolved");
        d.outcome = (d.votesRefund >= d.votesRelease) ? DisputeOutcome.RefundBuyer : DisputeOutcome.ReleaseFunds;
        d.resolved = true;
        emit DisputeResolved(disputeId, d.outcome);
    }

    /**
     * @notice Récupère le résultat du litige.
     * @param disputeId L'identifiant du litige.
     */
    function getDisputeOutcome(uint256 disputeId) external view returns (DisputeOutcome) {
        return disputes[disputeId].outcome;
    }
}
