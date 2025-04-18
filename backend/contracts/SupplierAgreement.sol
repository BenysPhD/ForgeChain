// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Importations OpenZeppelin
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SupplierAgreement
 * @notice Ce contrat déploie une plateforme blockchain pour la gestion d'accords fournisseurs,
 * intégrant des mécanismes de paiement en stablecoins, de confidentialité avancée (proofs ZK conceptuelles)
 * et émettant des événements pour faciliter l'interopérabilité avec des systèmes externes (ERP).
 */
contract SupplierAgreement is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Rôles
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // États du workflow de l'accord
    enum AgreementState {
        Negotiation,
        PendingPayment,
        Pending,
        InProgress,
        Dispatched,
        Completed,
        Disputed,
        Cancelled
    }

    /**
     * @notice Structure regroupant les paramètres essentiels d'un accord.
     */
    struct AgreementDetails {
        uint256 quantity;
        uint256 price;
        uint256 deadline;       // Timestamp d'échéance
        string ipfsHash;        // Stockage du hash (ex. document contractuel chiffré)
        AgreementState state;
    }
    // Un seul accord est géré dans ce contrat
    AgreementDetails public agreement;

    // Adresse du buyer (celui qui initie l'accord)
    address public buyer;

    /**
     * @notice Structure représentant les informations sur un fournisseur.
     */
    struct SupplierInfo {
        bool accepted;
        uint8 rating;  // Note (1 à 5)
    }
    mapping(address => SupplierInfo) public suppliers;
    address[] public supplierList;

    // Adresse du contrat OracleMock
    address public oracleAddress;

    // Interface du token stablecoin utilisé pour les paiements (ERC20)
    IERC20 public paymentToken;

    // Montant déposé en escrow
    uint256 public escrowAmount;

    // Événements pour la traçabilité et l'interopérabilité ERP
    event AgreementCreated(uint256 quantity, uint256 price, uint256 deadline, string ipfsHash);
    event AgreementStatusChanged(AgreementState indexed newState);
    event PaymentConfirmed(address indexed buyer, uint256 amount);
    event OrderDispatched(address indexed supplier);
    event DeliveryUpdated(bool success);
    event DisputeResolved(string decision);
    event SupplierRated(address indexed supplier, uint8 rating);
    event SustainabilityMetricsRecorded(
        address indexed supplier,
        uint256 carbonFootprint,
        uint256 energyConsumption,
        uint8 recycledMaterialUsage
    );
    event ZKProofSubmitted(address indexed supplier, bytes zkProof);
    // Événement destiné aux systèmes ERP
    event ERPDataUpdate(string eventType, string data);

    /**
     * @notice Constructeur qui initialise les rôles, l'oracle et le token de paiement.
     * @param _oracle Adresse du compte Oracle.
     * @param _arbitrator Adresse du compte Arbitrator.
     * @param _oracleAddress Adresse du contrat OracleMock.
     * @param _tokenAddress Adresse du token stablecoin (par exemple, USDC).
     */
    constructor(address _oracle, address _arbitrator, address _oracleAddress, address _tokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, _oracle);
        _grantRole(ARBITRATOR_ROLE, _arbitrator);
        buyer = msg.sender;
        oracleAddress = _oracleAddress;
        paymentToken = IERC20(_tokenAddress);
    }

    /**
     * @notice Permet au buyer de créer un accord.
     */
    function createAgreement(uint256 _quantity, uint256 _price, uint256 _deadline, string calldata _ipfsHash) external {
        require(msg.sender == buyer, unicode"Seul le buyer peut créer un accord");
        require(
            agreement.state == AgreementState.Negotiation || agreement.state == AgreementState.Cancelled,
            unicode"État invalide pour la création"
        );
        require(_deadline > block.timestamp, unicode"La deadline doit être dans le futur");

        agreement = AgreementDetails({
            quantity: _quantity,
            price: _price,
            deadline: _deadline,
            ipfsHash: _ipfsHash,
            state: AgreementState.Negotiation
        });
        emit AgreementCreated(_quantity, _price, _deadline, _ipfsHash);
        emit AgreementStatusChanged(AgreementState.Negotiation);
        emit ERPDataUpdate("AgreementCreated", _ipfsHash);
    }

    /**
     * @notice Permet à un fournisseur d'accepter l'accord en cours.
     */
    function acceptAgreement() external {
        require(agreement.state == AgreementState.Negotiation, unicode"Accord non en état de Negotiation");
        if (!suppliers[msg.sender].accepted) {
            suppliers[msg.sender].accepted = true;
            supplierList.push(msg.sender);
        }
    }

    /**
     * @notice Le buyer confirme le paiement via stablecoin.
     */
   function confirmPayment(uint256 _paymentAmount) external nonReentrant {
    require(msg.sender == buyer, unicode"Seul le buyer peut confirmer le paiement");
    require(agreement.state == AgreementState.Negotiation, unicode"L'accord doit être en état de Negotiation");

    uint256 requiredAmount = agreement.price * agreement.quantity;
    require(_paymentAmount == requiredAmount, unicode"Montant insuffisant pour l’accord");

    paymentToken.safeTransferFrom(msg.sender, address(this), _paymentAmount);
    escrowAmount = _paymentAmount;
    agreement.state = AgreementState.PendingPayment;

    emit PaymentConfirmed(msg.sender, _paymentAmount);
    emit AgreementStatusChanged(AgreementState.PendingPayment);
    emit ERPDataUpdate("PaymentConfirmed", uint2str(_paymentAmount));
}


    /**
     * @notice Permet de démarrer l'accord.
     */
    function startAgreement() external {
        require(block.timestamp <= agreement.deadline, unicode"La deadline est dépassée");
        agreement.state = AgreementState.Pending;
        emit AgreementStatusChanged(AgreementState.Pending);
        emit ERPDataUpdate("StartAgreement", "Order started");
    }

    /**
     * @notice Permet à un fournisseur de confirmer l'envoi de la marchandise.
     */
    function dispatchOrder() external {
        require(suppliers[msg.sender].accepted, unicode"Fournisseur non valide");
        require(agreement.state == AgreementState.Pending, unicode"État invalide pour l'envoi");
        agreement.state = AgreementState.Dispatched;
        emit OrderDispatched(msg.sender);
        emit AgreementStatusChanged(AgreementState.Dispatched);
        emit ERPDataUpdate("OrderDispatched", "Order dispatched");
    }

    /**
     * @notice Permet à l'oracle de mettre à jour l'état de la livraison.
     */
    function updateDeliveryStatus(bool _deliverySuccessful) external nonReentrant onlyRole(ORACLE_ROLE) {
        require(agreement.state == AgreementState.Dispatched, unicode"État invalide pour la livraison");
        emit DeliveryUpdated(_deliverySuccessful);
        if (_deliverySuccessful) {
            agreement.state = AgreementState.Completed;
            if (supplierList.length > 0) {
                paymentToken.safeTransfer(supplierList[0], escrowAmount);
            }
            escrowAmount = 0;
            emit AgreementStatusChanged(AgreementState.Completed);
            emit ERPDataUpdate("DeliverySuccess", unicode"Fonds libérés au fournisseur");
        } else {
            agreement.state = AgreementState.Disputed;
            emit AgreementStatusChanged(AgreementState.Disputed);
            emit ERPDataUpdate("DeliveryFailed", "Commande en litige");
        }
    }

    /**
     * @notice Permet à l'arbitre de résoudre un litige.
     */
    function resolveDispute(string calldata _decision) external nonReentrant onlyRole(ARBITRATOR_ROLE) {
        require(agreement.state == AgreementState.Disputed, unicode"État invalide pour la résolution du litige");
        if (keccak256(bytes(_decision)) == keccak256(bytes("RefundBuyer"))) {
            agreement.state = AgreementState.Cancelled;
            paymentToken.safeTransfer(buyer, escrowAmount);
            escrowAmount = 0;
        } else if (keccak256(bytes(_decision)) == keccak256(bytes("ReleaseFunds"))) {
            agreement.state = AgreementState.Completed;
            if (supplierList.length > 0) {
                paymentToken.safeTransfer(supplierList[0], escrowAmount);
            }
            escrowAmount = 0;
        }
        emit DisputeResolved(_decision);
        emit AgreementStatusChanged(agreement.state);
        emit ERPDataUpdate("DisputeResolved", _decision);
    }

    /**
     * @notice Permet au buyer d'évaluer un fournisseur.
     */
    function rateSupplier(address _supplier, uint8 _rating) external {
        require(msg.sender == buyer, unicode"Seul le buyer peut noter");
        require(_rating >= 1 && _rating <= 5, unicode"La note doit être entre 1 et 5");
        require(suppliers[_supplier].accepted, unicode"Fournisseur non engagé");
        suppliers[_supplier].rating = _rating;
        emit SupplierRated(_supplier, _rating);
        emit ERPDataUpdate("SupplierRated", uint2str(_rating));
    }

    /**
     * @notice Interroge l'oracle simulé pour obtenir la donnée actuelle.
     */
    function getOracleData() public view returns (int256 answer) {
        (, int256 _answer, , , ) = IOracleMock(oracleAddress).latestRoundData();
        return _answer;
    }

    /**
     * @notice Soumet une preuve Zero-Knowledge (conceptuelle).
     */
    function submitZKProof(bytes calldata zkProof) external {
        require(suppliers[msg.sender].accepted, unicode"Fournisseur non engagé");
        emit ZKProofSubmitted(msg.sender, zkProof);
        emit ERPDataUpdate("ZKProofSubmitted", "ZKP proof submitted");
    }

    /**
     * @notice Fonction utilitaire pour convertir un uint en string.
     */
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = uint8(48 + _i % 10);
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        return string(bstr);
    }
}

/**
 * @dev Interface minimale pour interagir avec le contrat OracleMock.
 */
interface IOracleMock {
    function latestRoundData() external view returns (
        uint80,
        int256,
        uint256,
        uint256,
        uint80
    );
}
