// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.4;

// import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "hardhat/console.sol";

// interface ILockContract {
//     function createLock(
//         uint256 _maxNumberOfKeys,
//         string memory _lockName,
//         uint256 _expirationDuration,
//         uint256 _keyPrice
//     ) external returns (address);
//     function setLockMetadata(
//         string memory _lockName,
//         string memory _lockSymbol,
//         string memory _baseTokenURI
//     ) external;
//     function purchaseKey(address _recipient) external payable;
//     function cancelKey(uint256 _tokenId) external;
//     function setOwner(address account) external;
//     function burn(uint256 _tokenId) external;
//     function updateLockConfig(
//         uint256 _newExpirationDuration,
//         uint256 _maxNumberOfKeys,
//         uint256 _maxKeysPerAcccount
//     ) external;
//     function owner() external view returns (address);
//     function name() external view returns (string memory _name);
//     function maxNumberOfKeys() external view returns (uint256);
//     function keyPrice() external view returns (uint256);
//     function expirationDuration() external view returns (uint256);
//     function getGlobalBaseTokenURI() external view returns (string memory);
// }

// contract LOCKMarketplace is Ownable {
//     using Counters for Counters.Counter;
//     Counters.Counter private _tokenIds;
//     Counters.Counter private _resaleItemsCounter;

//     struct Lock {
//         uint256 tokenId;
//         address lockAddress;
//         string lockName;
//         uint256 maxKeys;
//         uint256 keyPrice;
//         uint256 expirationDuration;
//         string tokenUri;
//         address originalOwner;
//     }

//     struct ResaleItem {
//         uint256 itemId;
//         address nftContract;
//         uint256 tokenId;
//         address payable seller;
//         uint256 price;
//     }

//     uint256 public constant FEE_PERCENTAGE = 2;
//     uint256 public removalFeeInMatic = 2.5 ether; // Initial hardcoded removal fee
//     address public constant FEE_RECIPIENT = 0xCA24562023f16B106C3E008Adc1e815b640D649C;

//     Lock[] public locks;
//     ResaleItem[] public resaleItems;
//     mapping(address => uint256) public lockIndex;
//     mapping(address => bool) public isLockOnMarketplace;
//     mapping(address => Lock[]) public locksByOwner;
//     mapping(address => uint256[]) public keysByOwner;
//     mapping(uint256 => ResaleItem) public resaleItemsMapping;

//     event LockAdded(address indexed lockAddress, uint256 tokenId, string lockName, uint256 maxKeys, uint256 keyPrice, uint256 expirationDuration, string tokenUri);
//     event LockRemoved(address indexed lockAddress);
//     event KeyPurchased(address indexed lockAddress, address indexed buyer, uint256 keyId);
//     event KeyCancelled(address indexed lockAddress, uint256 keyId);
//     event LockEdited(address indexed lockAddress, string newLockName, uint256 newMaxKeys, uint256 newKeyPrice, uint256 newExpirationDuration, string newTokenUri);
//     event ResaleItemAdded(uint256 itemId, address indexed nftContract, uint256 tokenId, address indexed seller, uint256 price);
//     event ResaleItemEdited(uint256 itemId, address indexed nftContract, uint256 tokenId, uint256 newPrice);
//     event ResaleItemRemoved(uint256 itemId, address indexed nftContract, uint256 tokenId, address indexed seller);
//     event ResaleItemPurchased(uint256 itemId, address indexed nftContract, uint256 tokenId, address indexed buyer, uint256 price);
//     event ErrorLog(string message);
//     event LogAddress(address message);

//     constructor() {}

//     modifier onlyOriginalOwner(address _lockAddress) {
//         require(locks[lockIndex[_lockAddress]].originalOwner == msg.sender, "Only original owner can call this function");
//         _;
//     }

//     modifier onlySeller(uint256 _itemId) {
//         require(resaleItemsMapping[_itemId].seller == msg.sender, "Only seller can call this function");
//         _;
//     }

//     modifier onlyLockOwner(address _lockAddress) {
//         require(ILockContract(_lockAddress).owner() == msg.sender, "Only lock owner can call this function");
//         _;
//     }

//     function setRemovalFeeInMatic(uint256 _removalFeeInMatic) external onlyOwner {
//         removalFeeInMatic = _removalFeeInMatic;
//     }

//     function addLock(address _lockAddress, string memory _TokenUri) external onlyLockOwner(_lockAddress) {
//         require(!isLockOnMarketplace[_lockAddress], "Lock already on marketplace");

//         ILockContract lockContract = ILockContract(_lockAddress);

//         string memory _lockName = lockContract.name();
//         uint256 _maxKeys = lockContract.maxNumberOfKeys();
//         uint256 _keyPrice = lockContract.keyPrice();
//         uint256 _expirationDuration = lockContract.expirationDuration();

//         uint256 newTokenId = _tokenIds.current();
//         Lock memory newLock = Lock({
//             tokenId: newTokenId,
//             lockAddress: _lockAddress,
//             lockName: _lockName,
//             maxKeys: _maxKeys,
//             keyPrice: _keyPrice,
//             expirationDuration: _expirationDuration,
//             tokenUri: _TokenUri,
//             originalOwner: msg.sender
//         });

//         locks.push(newLock);
//         locksByOwner[msg.sender].push(newLock);
//         lockIndex[_lockAddress] = locks.length - 1;
//         isLockOnMarketplace[_lockAddress] = true;

//         emit LockAdded(_lockAddress, newTokenId, _lockName, _maxKeys, _keyPrice, _expirationDuration, _TokenUri);
//         _tokenIds.increment();
//     }

//     function editLock(
//         address _lockAddress,
//         string memory _newLockName,
//         uint256 _newMaxKeys,
//         uint256 _newKeyPrice,
//         uint256 _newExpirationDuration,
//         string memory _newTokenUri,
//         string memory _newLockSymbol,
//         uint256 _maxKeysPerAcccount
//     ) external onlyOriginalOwner(_lockAddress) {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");

//         Lock storage lock = locks[lockIndex[_lockAddress]];
//         lock.lockName = _newLockName;
//         lock.maxKeys = _newMaxKeys;
//         lock.keyPrice = _newKeyPrice;
//         lock.expirationDuration = _newExpirationDuration;
//         lock.tokenUri = _newTokenUri;

//         ILockContract(lock.lockAddress).updateLockConfig(_newExpirationDuration, _newMaxKeys, _maxKeysPerAcccount);
//         ILockContract(lock.lockAddress).setLockMetadata(_newLockName, _newLockSymbol, _newTokenUri);

//         emit LockEdited(_lockAddress, _newLockName, _newMaxKeys, _newKeyPrice, _newExpirationDuration, _newTokenUri);
//     }

//     function removeLock(address _lockAddress) external onlyOriginalOwner(_lockAddress) {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");

//         uint256 index = lockIndex[_lockAddress];
//         uint256 lastIndex = locks.length - 1;
//         if (index != lastIndex) {
//             Lock memory lastLock = locks[lastIndex];
//             locks[index] = lastLock;
//             lockIndex[lastLock.lockAddress] = index;
//         }
//         locks.pop();
//         delete lockIndex[_lockAddress];
//         delete isLockOnMarketplace[_lockAddress];

//         emit LockRemoved(_lockAddress);
//     }

//     function purchaseKey(address _lockAddress) external payable {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");

//         Lock storage lock = locks[lockIndex[_lockAddress]];
//         require(msg.value >= lock.keyPrice, "Insufficient payment");

//         uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
//         uint256 paymentToOwner = msg.value - fee;

//         (bool feeSuccess, ) = payable(FEE_RECIPIENT).call{value: fee}("");
//         require(feeSuccess, "Fee payment failed");

//         (bool ownerSuccess, ) = payable(lock.originalOwner).call{value: paymentToOwner}("");
//         require(ownerSuccess, "Payment to owner failed");

//         ILockContract(lock.lockAddress).purchaseKey{value: msg.value}(msg.sender);
//         keysByOwner[msg.sender].push(lock.tokenId);

//         emit KeyPurchased(lock.lockAddress, msg.sender, 0); // Replace 0 with actual tokenId if available
//     }

//     function cancelKey(address _lockAddress, uint256 _tokenId) external {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");
//         require(isKeyOwner(_lockAddress, _tokenId, msg.sender), "Only key owner can cancel the key");

//         ILockContract(_lockAddress).cancelKey(_tokenId);
//         emit KeyCancelled(_lockAddress, _tokenId);
//     }

//     function isKeyOwner(address _lockAddress, uint256 _tokenId, address _owner) internal view returns (bool) {
//         uint256[] storage keys = keysByOwner[_owner];
//         for (uint256 i = 0; i < keys.length; i++) {
//             if (keys[i] == _tokenId) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     function burnKey(address _lockAddress, uint256 _tokenId) external onlyOriginalOwner(_lockAddress) {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");
//         ILockContract(_lockAddress).burn(_tokenId);
//         emit KeyCancelled(_lockAddress, _tokenId);
//     }

//     function listResaleItem(address _nftContract, uint256 _tokenId, uint256 _price) external {
//         require(IERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "Only the owner can list the resale item");

//         IERC721(_nftContract).approve(address(this), _tokenId);

//         uint256 newItemId = _resaleItemsCounter.current();
//         ResaleItem memory newItem = ResaleItem({
//             itemId: newItemId,
//             nftContract: _nftContract,
//             tokenId: _tokenId,
//             seller: payable(msg.sender),
//             price: _price
//         });

//         resaleItems.push(newItem);
//         resaleItemsMapping[newItemId] = newItem;

//         emit ResaleItemAdded(newItemId, _nftContract, _tokenId, msg.sender, _price);

//         _resaleItemsCounter.increment();
//     }

//     function editResaleItem(uint256 _itemId, uint256 _newPrice) external onlySeller(_itemId) {
//         ResaleItem storage item = resaleItemsMapping[_itemId];
//         item.price = _newPrice;
//         emit ResaleItemEdited(_itemId, item.nftContract, item.tokenId, _newPrice);
//     }

//     function removeResaleItem(uint256 _itemId) external payable onlySeller(_itemId) {
//         require(msg.value >= removalFeeInMatic, "Insufficient removal fee");

//         ResaleItem storage item = resaleItemsMapping[_itemId];
//         IERC721(item.nftContract).approve(msg.sender, item.tokenId);

//         uint256 index;
//         for (index = 0; index < resaleItems.length; index++) {
//             if (resaleItems[index].itemId == _itemId) {
//                 break;
//             }
//         }

//         uint256 lastIndex = resaleItems.length - 1;

//         if (index != lastIndex) {
//             ResaleItem memory lastItem = resaleItems[lastIndex];
//             resaleItems[index] = lastItem;
//             resaleItemsMapping[lastItem.itemId] = lastItem;
//         }

//         resaleItems.pop();
//         delete resaleItemsMapping[_itemId];

//         (bool feeSuccess, ) = payable(FEE_RECIPIENT).call{value: msg.value}("");
//         require(feeSuccess, "Fee payment failed");

//         emit ResaleItemRemoved(item.itemId, item.nftContract, item.tokenId, msg.sender);
//     }

//     function purchaseResaleItem(uint256 _itemId) external payable {
//         ResaleItem storage item = resaleItemsMapping[_itemId];
//         require(msg.value >= item.price, "Insufficient payment");

//         // Verify the current ownership of the NFT
//         address currentOwner = IERC721(item.nftContract).ownerOf(item.tokenId);
//         if (currentOwner != item.seller) {
//             removeResaleItemInternal(_itemId);
//             revert("Seller no longer owns this NFT");
//         }

//         uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
//         uint256 paymentToSeller = msg.value - fee;

//         (bool feeSuccess, ) = payable(FEE_RECIPIENT).call{value: fee}("");
//         require(feeSuccess, "Fee payment failed");

//         (bool sellerSuccess, ) = item.seller.call{value: paymentToSeller}("");
//         require(sellerSuccess, "Payment to seller failed");

//         IERC721(item.nftContract).transferFrom(item.seller, msg.sender, item.tokenId);
//         removeResaleItemInternal(_itemId);

//         emit ResaleItemPurchased(item.itemId, item.nftContract, item.tokenId, msg.sender, item.price);
//     }

//     function removeResaleItemInternal(uint256 _itemId) internal {
//         ResaleItem storage item = resaleItemsMapping[_itemId];
//         uint256 index = findResaleItemIndex(_itemId);
//         uint256 lastIndex = resaleItems.length - 1;
//         if (index != lastIndex) {
//             resaleItems[index] = resaleItems[lastIndex];
//         }
//         resaleItems.pop();
//         delete resaleItemsMapping[_itemId];

//         emit ResaleItemRemoved(item.itemId, item.nftContract, item.tokenId, item.seller);
//     }


//     function findResaleItemIndex(uint256 _itemId) internal view returns (uint256) {
//         for (uint256 i = 0; i < resaleItems.length; i++) {
//             if (resaleItems[i].itemId == _itemId) {
//                 return i;
//             }
//         }
//         revert("Resale item not found");
//     }

//     function syncLock(address _lockAddress) public payable{
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");

//         Lock storage lock = locks[lockIndex[_lockAddress]];
//         ILockContract lockContract = ILockContract(lock.lockAddress);

//         lock.lockName = lockContract.name();
//         lock.maxKeys = lockContract.maxNumberOfKeys();
//         lock.keyPrice = lockContract.keyPrice();
//         lock.expirationDuration = lockContract.expirationDuration();
//         lock.tokenUri = lockContract.getGlobalBaseTokenURI();
//     }

//     function viewLockDetails(address _lockAddress) public returns (Lock memory) {
//         syncLock(_lockAddress);
//         return locks[lockIndex[_lockAddress]];
//     }

//     function viewMyLocks(address _owner) public returns (Lock[] memory) {
//         Lock[] memory ownerLocks = locksByOwner[_owner];
//         for (uint256 i = 0; i < ownerLocks.length; i++) {
//             syncLock(ownerLocks[i].lockAddress);
//         }
//         return ownerLocks;
//     }

//     function viewLocks() public returns (Lock[] memory) {
//         for (uint256 i = 0; i < locks.length; i++) {
//             syncLock(locks[i].lockAddress);
//         }
//         return locks;
//     }

//     function viewResaleItemDetails(uint256 _itemId) public view returns (ResaleItem memory) {
//         require(_itemId < resaleItems.length, "Invalid itemId");
//         return resaleItemsMapping[_itemId];
//     }
// }
