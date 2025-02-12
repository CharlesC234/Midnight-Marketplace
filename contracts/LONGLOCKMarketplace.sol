// // SPDX-License-Identifier: MIT
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

// contract LONGLOCKMarketplace is Ownable {
//     using Counters for Counters.Counter;
//     Counters.Counter private _tokenIds;
//     Counters.Counter private _resaleItemsCounter;

//     struct Lock {
//         uint256 tokenId;
//         address lockAddress;
//         string lockName;
//         uint256 maxKeys;
//         uint256 priceMatic;
//         uint256 expirationDuration;
//         string tokenUri;
//         address originalOwner;
//         bool USDConstant;
//         bool IsPrivate;
//         uint256 priceUSD;
//         string[] tags;
//         uint256 purchaseDate; 
//     }

//     struct ResaleItem {
//         uint256 itemId;
//         address nftContract;
//         uint256 tokenId;
//         address payable seller;
//         uint256 priceMatic;
//         bool USDConstant;
//         uint256 priceUSD;
//         bool IsPrivate;
//         string[] tags;
//         uint256 purchaseDate; 
//     }

//     struct CartItem {
//         address nftAddress;
//         bool isResaleItem;
//     }

//     uint256 public constant FEE_PERCENTAGE = 2;
//     uint256 public removalFeeInMatic = 2.5 ether; 
//     address public constant FEE_RECIPIENT = 0xCA24562023f16B106C3E008Adc1e815b640D649C;

//     Lock[] public locks;
//     ResaleItem[] public resaleItems;
//     mapping(address => uint256) public lockIndex;
//     mapping(address => bool) public isLockOnMarketplace;
//     mapping(address => Lock[]) public locksByOwner;
//     mapping(address => uint256[]) public keysByOwner;
//     mapping(uint256 => ResaleItem) public resaleItemsMapping;
//     mapping(address => CartItem[]) private cart; 

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



//     function levenshteinDistance(string memory s1, string memory s2) internal pure returns (uint256) {
//     bytes memory b1 = bytes(s1);
//     bytes memory b2 = bytes(s2);
//     uint256 len1 = b1.length;
//     uint256 len2 = b2.length;
//     uint256[][] memory dp = new uint256[][](len1 + 1);
    
//     for (uint256 i = 0; i <= len1; i++) {
//         dp[i] = new uint256[](len2 + 1);
//         dp[i][0] = i;
//     }
    
//     for (uint256 j = 0; j <= len2; j++) {
//         dp[0][j] = j;
//     }
    
//     for (uint256 i = 1; i <= len1; i++) {
//         for (uint256 j = 1; j <= len2; j++) {
//             uint256 cost = (b1[i - 1] == b2[j - 1]) ? 0 : 1;
//             dp[i][j] = min(
//                 dp[i - 1][j] + 1, 
//                 min(
//                     dp[i][j - 1] + 1, 
//                     dp[i - 1][j - 1] + cost 
//                 )
//             );
//         }
//     }
    
//     return dp[len1][len2];
//     }

//     function min(uint256 a, uint256 b) internal pure returns (uint256) {
//         return a < b ? a : b;
//     }


//     function addLock(
//         address _lockAddress,
//         string memory _TokenUri,
//         bool _USDConstant,
//         bool priv,
//         uint256 _priceUSD,
//         string[] memory _tags
//     ) external onlyLockOwner(_lockAddress) {
//         require(!isLockOnMarketplace[_lockAddress], "Lock already on marketplace");

//         ILockContract lockContract = ILockContract(_lockAddress);

//         uint256 newTokenId = _tokenIds.current();
//         Lock memory newLock = Lock({
//             tokenId: newTokenId,
//             lockAddress: _lockAddress,
//             lockName: lockContract.name(),
//             maxKeys: lockContract.maxNumberOfKeys(),
//             priceMatic: lockContract.keyPrice(),
//             expirationDuration: lockContract.expirationDuration(),
//             tokenUri: _TokenUri,
//             originalOwner: msg.sender,
//             USDConstant: _USDConstant,
//             IsPrivate: priv,
//             priceUSD: _priceUSD,
//             tags: _tags,
//             purchaseDate: 0
//         });

//         locks.push(newLock);
//         locksByOwner[msg.sender].push(newLock);
//         lockIndex[_lockAddress] = locks.length - 1;
//         isLockOnMarketplace[_lockAddress] = true;

//         _tokenIds.increment();
//     }

//     function editLock(
//         address _lockAddress,
//         string memory _newLockName,
//         uint256 _newMaxKeys,
//         uint256 _newPriceMatic,
//         uint256 _newExpirationDuration,
//         string memory _newTokenUri,
//         string memory _newLockSymbol,
//         uint256 _maxKeysPerAcccount
//     ) external onlyOriginalOwner(_lockAddress) {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");

//         Lock storage lock = locks[lockIndex[_lockAddress]];
//         lock.lockName = _newLockName;
//         lock.maxKeys = _newMaxKeys;
//         lock.priceMatic = _newPriceMatic;
//         lock.expirationDuration = _newExpirationDuration;
//         lock.tokenUri = _newTokenUri;

//         ILockContract(lock.lockAddress).updateLockConfig(_newExpirationDuration, _newMaxKeys, _maxKeysPerAcccount);
//         ILockContract(lock.lockAddress).setLockMetadata(_newLockName, _newLockSymbol, _newTokenUri);

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

//     }

//     function purchaseKey(address _lockAddress, uint256 conversionRate) public payable {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");

//         Lock storage lock = locks[lockIndex[_lockAddress]];

//         // Update the price using the conversion rate
//         if (lock.USDConstant) {
//             lock.priceMatic = convertUSDToMatic(lock.priceUSD, conversionRate);
//         } else {
//             lock.priceUSD = convertMaticToUSD(lock.priceMatic, conversionRate);
//         }

//         require(msg.value >= lock.priceMatic, "Insufficient payment");

//         uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
//         uint256 paymentToOwner = msg.value - fee;

//         (bool feeSuccess, ) = payable(FEE_RECIPIENT).call{value: fee}("");
//         require(feeSuccess, "Fee payment failed");

//         (bool ownerSuccess, ) = payable(lock.originalOwner).call{value: paymentToOwner}("");
//         require(ownerSuccess, "Payment to lock owner failed");

//         ILockContract(lock.lockAddress).purchaseKey{value: msg.value}(msg.sender);

//         keysByOwner[msg.sender].push(lock.tokenId);
//         locks[lockIndex[_lockAddress]].purchaseDate = block.timestamp;

//     }

//     function addResaleItem(
//         address _nftContract,
//         uint256 _tokenId,
//         uint256 _priceMatic,
//         bool _USDConstant,
//         uint256 _priceUSD,
//         bool priv,
//         string[] memory _tags
//     ) external {
//         ERC721 nftContract = ERC721(_nftContract);
//         require(nftContract.ownerOf(_tokenId) == msg.sender, "Only the owner can list the item");

//         uint256 newItemId = _resaleItemsCounter.current();

//         ResaleItem memory newItem = ResaleItem({
//             itemId: newItemId,
//             nftContract: _nftContract,
//             tokenId: _tokenId,
//             seller: payable(msg.sender),
//             priceMatic: _priceMatic,
//             USDConstant: _USDConstant,
//             priceUSD: _priceUSD,
//             IsPrivate: priv,
//             tags: _tags,
//             purchaseDate: 0
//         });

//         resaleItems.push(newItem);
//         resaleItemsMapping[newItemId] = newItem;

//         _resaleItemsCounter.increment();
//     }

//     function editResaleItem(uint256 _itemId, uint256 _newPriceMatic, uint256 _newPriceUSD) external onlySeller(_itemId) {
//         ResaleItem storage item = resaleItemsMapping[_itemId];
//         item.priceMatic = _newPriceMatic;
//         item.priceUSD = _newPriceUSD;
//     }

//     function removeResaleItem(uint256 _itemId) external onlySeller(_itemId) {
//         uint256 index = _itemId;
//         uint256 lastIndex = resaleItems.length - 1;

//         if (index != lastIndex) {
//             ResaleItem memory lastItem = resaleItems[lastIndex];
//             resaleItems[index] = lastItem;
//             resaleItemsMapping[lastItem.itemId] = lastItem;
//         }

//         resaleItems.pop();
//         delete resaleItemsMapping[_itemId];
//     }

//     function purchaseResaleItem(uint256 _itemId, uint256 conversionRate) public payable {
//         ResaleItem storage item = resaleItemsMapping[_itemId];

//         // Update the price using the conversion rate
//         if (item.USDConstant) {
//             item.priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
//         } else {
//             item.priceUSD = convertMaticToUSD(item.priceMatic, conversionRate);
//         }

//         require(msg.value >= item.priceMatic, "Insufficient payment");

//         uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
//         uint256 paymentToSeller = msg.value - fee;

//         (bool feeSuccess, ) = payable(FEE_RECIPIENT).call{value: fee}("");
//         require(feeSuccess, "Fee payment failed");

//         (bool sellerSuccess, ) = item.seller.call{value: paymentToSeller}("");
//         require(sellerSuccess, "Payment to seller failed");

//         ERC721(item.nftContract).safeTransferFrom(item.seller, msg.sender, item.tokenId);
//         item.purchaseDate = block.timestamp;
//     }

//     function addItemToCart(address _nftAddress, bool _isResaleItem) external {
//         CartItem memory newItem = CartItem({
//             nftAddress: _nftAddress,
//             isResaleItem: _isResaleItem
//         });

//         cart[msg.sender].push(newItem);
//     }

//     function removeItemFromCart(address _nftAddress) external {
//         CartItem[] storage userCart = cart[msg.sender];
//         uint256 indexToRemove;
//         bool found = false;

//         for (uint256 i = 0; i < userCart.length; i++) {
//             if (userCart[i].nftAddress == _nftAddress) {
//                 indexToRemove = i;
//                 found = true;
//                 break;
//             }
//         }

//         require(found, "Item not found in cart");

//         uint256 lastIndex = userCart.length - 1;
//         if (indexToRemove != lastIndex) {
//             userCart[indexToRemove] = userCart[lastIndex];
//         }

//         userCart.pop();
//     }

//     function getCartLength() external view returns (uint256){
//         CartItem[] storage userCart = cart[msg.sender];
//         return userCart.length;
//     }

//     function getCartTotal(uint256 conversionRate) external returns (uint256) {
//         CartItem[] storage userCart = cart[msg.sender];
//         uint256 totalCost = 0;

//         for (uint256 i = 0; i < userCart.length; i++) {
//             if (userCart[i].isResaleItem) {
//                 ResaleItem storage item = resaleItemsMapping[resaleItems[i].itemId];
//                 if (item.USDConstant) {
//                     item.priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
//                 }
//                 totalCost += item.priceMatic;
//             } else {
//                 Lock storage lock = locks[lockIndex[userCart[i].nftAddress]];
//                 if (lock.USDConstant) {
//                     lock.priceMatic = convertUSDToMatic(lock.priceUSD, conversionRate);
//                 }
//                 totalCost += lock.priceMatic;
//             }
//         }

//         return totalCost;
//     }


//     function purchaseCart(uint256 conversionRate) external payable {
//         CartItem[] storage userCart = cart[msg.sender];
//         uint256 totalCost = 0;

//         for (uint256 i = 0; i < userCart.length; i++) {
//             if (userCart[i].isResaleItem) {
//                 ResaleItem storage item = resaleItemsMapping[resaleItems[i].itemId];
//                 if (item.USDConstant) {
//                     item.priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
//                 }
//                 totalCost += item.priceMatic;
//             } else {
//                 Lock storage lock = locks[lockIndex[userCart[i].nftAddress]];
//                 if (lock.USDConstant) {
//                     lock.priceMatic = convertUSDToMatic(lock.priceUSD, conversionRate);
//                 }
//                 totalCost += lock.priceMatic;
//             }
//         }

//         require(msg.value >= totalCost, "Insufficient payment for cart items");

//         for (uint256 i = 0; i < userCart.length; i++) {
//             if (userCart[i].isResaleItem) {
//                 purchaseResaleItem(resaleItems[i].itemId, conversionRate);
//             } else {
//                 purchaseKey(userCart[i].nftAddress, conversionRate);
//             }
//         }

//         delete cart[msg.sender];
//     }

//     function getUserCart() external view returns (CartItem[] memory) {
//         return cart[msg.sender];
//     }

//     function convertUSDToMatic(uint256 amountUSD, uint256 conversionRate) public pure returns (uint256) {
//         // Ensure that the conversion rate is provided in terms of Matic per USD
//         return (amountUSD * conversionRate) / 1 ether;
//     }

//     function convertMaticToUSD(uint256 amountMatic, uint256 conversionRate) public pure returns (uint256) {
//         // Ensure that the conversion rate is provided in terms of USD per Matic
//         return (amountMatic * 1 ether) / conversionRate;
//     }

//     function syncLock(address _lockAddress) public payable{
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");

//         Lock storage lock = locks[lockIndex[_lockAddress]];
//         ILockContract lockContract = ILockContract(lock.lockAddress);

//         lock.lockName = lockContract.name();
//         lock.maxKeys = lockContract.maxNumberOfKeys();
//         lock.priceMatic = lockContract.keyPrice();
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

//     function viewLocks(string memory filter, uint256 lastindex, uint256 amountToGet) external returns (Lock[] memory) {
//         Lock[] memory filteredLocks = new Lock[](amountToGet);
//         uint256 count = 0;

//         for (uint256 i = lastindex; i < locks.length && count < amountToGet; i++) {
//             bool include = (bytes(filter).length == 0);

//             if(!locks[i].IsPrivate){
//             if (!include) {
//                 for (uint256 j = 0; j < locks[i].tags.length; j++) {
//                     if (keccak256(abi.encodePacked(locks[i].tags[j])) == keccak256(abi.encodePacked(filter))) {
//                         include = true;
//                         break;
//                     }
//                 }
//             }

//             if (include) {
//                 syncLock(locks[i].lockAddress);
//                 filteredLocks[count] = locks[i];
//                 count++;
//             }
//             }
//         }

//         return filteredLocks;
//     }


//     function searchLocks(string memory searchKey, uint256 lastindex, uint256 amountToGet) external returns (Lock[] memory) {
//     uint256[] memory distances = new uint256[](locks.length);
//     for (uint256 i = 0; i < locks.length; i++) {
//         if(!locks[i].IsPrivate){
//         distances[i] = levenshteinDistance(searchKey, locks[i].lockName);
//         }
//     }

//     for (uint256 i = 0; i < locks.length; i++) {
//         if(!locks[i].IsPrivate){
//         for (uint256 j = i + 1; j < locks.length; j++) {
//             if (distances[j] < distances[i]) {

//                 uint256 tempDist = distances[i];
//                 distances[i] = distances[j];
//                 distances[j] = tempDist;

//                 Lock memory tempLock = locks[i];
//                 locks[i] = locks[j];
//                 locks[j] = tempLock;
//             }
//         }
//         }
//     }

//     Lock[] memory resultLocks = new Lock[](amountToGet);
//     uint256 count = 0;
//     for (uint256 i = lastindex; i < locks.length && count < amountToGet; i++) {
//         if(!locks[i].IsPrivate){
//         resultLocks[count] = locks[i];
//         count++;
//         }
//     }

//     return resultLocks;
//     }


//     function viewResaleItems(string memory filter, uint256 lastindex, uint256 amountToGet) external view returns (ResaleItem[] memory) {
//     ResaleItem[] memory filteredItems = new ResaleItem[](amountToGet);
//     uint256 count = 0;

//     for (uint256 i = lastindex; i < resaleItems.length && count < amountToGet; i++) {
//         bool include = (bytes(filter).length == 0);

//         if(!resaleItems[i].IsPrivate){
//         if (!include) {
//             for (uint256 j = 0; j < resaleItems[i].tags.length; j++) {
//                 if (keccak256(abi.encodePacked(resaleItems[i].tags[j])) == keccak256(abi.encodePacked(filter))) {
//                     include = true;
//                     break;
//                 }
//             }
//         }

//         if (include) {
//             filteredItems[count] = resaleItems[i];
//             count++;
//         }}
//     }

//     return filteredItems;
//     }



//     function searchResaleItems(string memory searchKey, uint256 lastindex, uint256 amountToGet) external returns (ResaleItem[] memory) {
//     uint256[] memory distances = new uint256[](resaleItems.length);
//     for (uint256 i = 0; i < resaleItems.length; i++) {
//         if(!resaleItems[i].IsPrivate){
//         distances[i] = levenshteinDistance(searchKey, ERC721URIStorage(resaleItems[i].nftContract).name());
//         }
//     }

//     for (uint256 i = 0; i < resaleItems.length; i++) {
//         if(!resaleItems[i].IsPrivate){
//         for (uint256 j = i + 1; j < resaleItems.length; j++) {
//             if (distances[j] < distances[i]) {

//                 uint256 tempDist = distances[i];
//                 distances[i] = distances[j];
//                 distances[j] = tempDist;

//                 ResaleItem memory tempItem = resaleItems[i];
//                 resaleItems[i] = resaleItems[j];
//                 resaleItems[j] = tempItem;
//             }
//         }}
//     }

//     // Get the paginated result
//     ResaleItem[] memory resultItems = new ResaleItem[](amountToGet);
//     uint256 count = 0;
//     for (uint256 i = lastindex; i < resaleItems.length && count < amountToGet; i++) {
//         if(!resaleItems[i].IsPrivate){
//         resultItems[count] = resaleItems[i];
//         count++;
//         }
//     }

//     return resultItems;
//     }


//     function viewResaleItemDetails(uint256 _itemId) public view returns (ResaleItem memory) {
//         require(_itemId < resaleItems.length, "Invalid itemId");
//         return resaleItemsMapping[_itemId];
//     }

//     function burnKey(address _lockAddress, uint256 _tokenId) external onlyOriginalOwner(_lockAddress) {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");
//         ILockContract(_lockAddress).burn(_tokenId);
//     }

//     function cancelKey(address _lockAddress, uint256 _tokenId) external {
//         require(isLockOnMarketplace[_lockAddress], "Lock not on marketplace");
//         require(isKeyOwner(_tokenId, msg.sender), "Only key owner can cancel the key");

//         ILockContract(_lockAddress).cancelKey(_tokenId);
//     }

//     function isKeyOwner(uint256 _tokenId, address _owner) internal view returns (bool) {
//         uint256[] storage keys = keysByOwner[_owner];
//         for (uint256 i = 0; i < keys.length; i++) {
//             if (keys[i] == _tokenId) {
//                 return true;
//             }
//         }
//         return false;
//     }
// }
