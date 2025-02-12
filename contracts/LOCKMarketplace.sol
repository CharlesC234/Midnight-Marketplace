// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface ILockContract {
    function createLock(
        uint256 _maxNumberOfKeys,
        string memory _lockName,
        uint256 _expirationDuration,
        uint256 _keyPrice
    ) external returns (address);
    function setLockMetadata(
        string memory _lockName,
        string memory _lockSymbol,
        string memory _baseTokenURI
    ) external;
    function purchaseKey(address _recipient) external payable;
    function cancelKey(uint256 _tokenId) external;
    function setOwner(address account) external;
    function burn(uint256 _tokenId) external;
    function updateLockConfig(
        uint256 _newExpirationDuration,
        uint256 _maxNumberOfKeys,
        uint256 _maxKeysPerAcccount
    ) external;
    function owner() external view returns (address);
    function name() external view returns (string memory _name);
    function maxNumberOfKeys() external view returns (uint256);
    function keyPrice() external view returns (uint256);
    function expirationDuration() external view returns (uint256);
    function getGlobalBaseTokenURI() external view returns (string memory);
}

contract LOCKMarketplace is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _marketplaceItems;

    struct MarketplaceItem {
        uint256 tokenId;
        address itemAddress;
        string name;
        bool isLock;
        uint256 maxKeys;
        uint256 priceMatic;
        uint256 expirationDuration;
        string tokenUri;
        address owner;
        bool usdConstant;
        bool isPrivate;
        uint256 priceUSD;
        string[] tags;
        uint256 purchaseDate; 
    }

    struct CartItem {
        address itemAddress;
        bool isLock;
    }

    uint256 public constant FEE_PERCENTAGE = 2;
    uint256 public removalFeeInMatic = 2.5 ether; 
    address public constant FEE_RECIPIENT = 0xCA24562023f16B106C3E008Adc1e815b640D649C;

    MarketplaceItem[] public marketplaceItems;
    mapping(address => uint256) public itemIndex;
    mapping(address => bool) public isItemOnMarketplace;
    mapping(address => MarketplaceItem[]) public itemsByOwner;
    mapping(address => MarketplaceItem[]) public purchasedItems;
    mapping(address => uint256[]) public keysByOwner;
    mapping(address => CartItem[]) private cart; 

    constructor() {}
    
    modifier onlyItemOwner(address _itemAddress) {
        require(marketplaceItems[itemIndex[_itemAddress]].owner == msg.sender, "Only original owner can call this function");
        _;
    }

    modifier onlyLockOwner(address _itemAddress) {
        require(ILockContract(_itemAddress).owner() == msg.sender, "Only lock owner can call this function");
        _;
    }

    function setRemovalFeeInMatic(uint256 _removalFeeInMatic) external onlyOwner{
        removalFeeInMatic = _removalFeeInMatic;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }


    function addMarketPlaceItem(
        bool _isLock,
        address _itemAddress,
        string memory _TokenUri,
        uint256 _tokenId,
        bool _USDConstant,
        bool priv,
        uint256 _priceUSD,
        uint256 _priceMatic,
        string[] memory _tags,
        uint256 conversionRate
    ) external onlyItemOwner(_itemAddress) {
        require(!isItemOnMarketplace[_itemAddress], "Already on marketplace");

        if(!_isLock){

        ERC721 nftContract = ERC721(_itemAddress);
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Only the owner can list the item");
            MarketplaceItem memory newMarketplaceItem = MarketplaceItem({
                tokenId: _tokenId,
                itemAddress: _itemAddress,
                name: "",
                isLock: false,
                maxKeys: 1, 
                priceMatic: _USDConstant ? convertUSDToMatic(_priceUSD, conversionRate) : _priceMatic,
                expirationDuration: 0,
                tokenUri: "",
                owner: payable(msg.sender),
                usdConstant: _USDConstant,
                isPrivate: priv,
                priceUSD: _USDConstant ? _priceUSD : convertMaticToUSD(_priceMatic, conversionRate),
                tags: _tags,
                purchaseDate: 0
            });

            marketplaceItems.push(newMarketplaceItem);
            itemsByOwner[msg.sender].push(newMarketplaceItem);

        }else{

            ILockContract lockContract = ILockContract(_itemAddress);
            uint256 newTokenId = _tokenIds.current();
            MarketplaceItem memory newMarketplaceItem = MarketplaceItem({
                tokenId: newTokenId,
                itemAddress: _itemAddress,
                isLock: true, 
                name: lockContract.name(),
                maxKeys: lockContract.maxNumberOfKeys(),
                priceMatic: lockContract.keyPrice(),
                expirationDuration: lockContract.expirationDuration(),
                tokenUri: _TokenUri,
                owner: msg.sender,
                usdConstant: _USDConstant,
                isPrivate: priv,
                priceUSD: _priceUSD,
                tags: _tags,
                purchaseDate: 0
            });
            marketplaceItems.push(newMarketplaceItem);
            itemsByOwner[msg.sender].push(newMarketplaceItem);
        }

        itemIndex[_itemAddress] = marketplaceItems.length - 1;
        isItemOnMarketplace[_itemAddress] = true;

        _marketplaceItems.increment();
        _tokenIds.increment();
    }



    function editMarketplaceItem(
        address _itemAddress,
        string memory _newItemName,
        uint256 _newMaxKeys,
        uint256 _newExpirationDuration,
        string memory _newTokenUri,
        string memory _newItemSymbol,
        uint256 _maxKeysPerAcccount,
        bool _USDConstant,
        bool priv,
        uint256 _newPrice,
        string[] memory _newTags,
        uint256 conversionRate
    ) external onlyItemOwner(_itemAddress) {
        require(isItemOnMarketplace[_itemAddress], "Item not on marketplace");
        uint256 index = itemIndex[_itemAddress];
        MarketplaceItem storage item = marketplaceItems[index];
        if(item.isLock){
            marketplaceItems[index].name = _newItemName;
            marketplaceItems[index].maxKeys = _newMaxKeys;
            marketplaceItems[index].priceMatic = _USDConstant ? convertUSDToMatic(_newPrice, conversionRate) : _newPrice;
            marketplaceItems[index].expirationDuration = _newExpirationDuration;
            marketplaceItems[index].tokenUri = _newTokenUri;
            marketplaceItems[index].usdConstant = _USDConstant;
            marketplaceItems[index].isPrivate = priv;
            marketplaceItems[index].priceUSD = _USDConstant ? _newPrice : convertMaticToUSD(_newPrice, conversionRate);
            marketplaceItems[index].tags = _newTags;

            ILockContract(_itemAddress).updateLockConfig(_newExpirationDuration, _newMaxKeys, _maxKeysPerAcccount);
            ILockContract(_itemAddress).setLockMetadata(_newItemName, _newItemSymbol, _newTokenUri);

        }else{
            marketplaceItems[index].priceMatic = _USDConstant ? convertUSDToMatic(_newPrice, conversionRate) : _newPrice;
            marketplaceItems[index].usdConstant = _USDConstant;
            marketplaceItems[index].isPrivate = priv;
            marketplaceItems[index].priceUSD = _USDConstant ? _newPrice : convertMaticToUSD(_newPrice, conversionRate);
            marketplaceItems[index].tags = _newTags;
        }

    }


    function removeMarketplaceItem(address _itemAddress) external onlyItemOwner(_itemAddress) {
        require(isItemOnMarketplace[_itemAddress], "Item not on marketplace");

        uint256 index = itemIndex[_itemAddress];
        uint256 lastIndex = marketplaceItems.length - 1;
        if (index != lastIndex) {
            MarketplaceItem memory lastItem = marketplaceItems[lastIndex];
            marketplaceItems[index] = lastItem;
            itemIndex[lastItem.itemAddress] = index;
        }
        marketplaceItems.pop();
        delete itemIndex[_itemAddress];
        delete isItemOnMarketplace[_itemAddress];

    }


    function purchaseItem(address _address, uint256 conversionRate) public payable {
        require(isItemOnMarketplace[_address], "Item not on marketplace");

        MarketplaceItem storage item = marketplaceItems[itemIndex[_address]];

        // Update the price using the conversion rate
        if (item.usdConstant) {
            marketplaceItems[itemIndex[_address]].priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
        } else {
            marketplaceItems[itemIndex[_address]].priceUSD = convertMaticToUSD(item.priceMatic, conversionRate);
        }

        require(msg.value >= item.priceMatic, "Insufficient payment");


        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 paymentToSeller = msg.value - fee;

        (bool feeSuccess, ) = payable(FEE_RECIPIENT).call{value: fee}("");
        require(feeSuccess, "Fee payment failed");

        if(item.isLock){

            (bool ownerSuccess, ) = payable(item.owner).call{value: paymentToSeller}("");
            require(ownerSuccess, "Payment to lock owner failed");

            ILockContract(item.itemAddress).purchaseKey{value: msg.value}(msg.sender);

            keysByOwner[msg.sender].push(item.tokenId);

        }else{

            (bool sellerSuccess, ) = item.owner.call{value: paymentToSeller}("");
            require(sellerSuccess, "Payment to seller failed");

            ERC721(item.itemAddress).safeTransferFrom(item.owner, msg.sender, item.tokenId);

        }

        marketplaceItems[itemIndex[_address]].purchaseDate = block.timestamp;
        purchasedItems[msg.sender].push(item);
    }


    function addItemToCart(address _address, bool _isLock, uint256 conversionRate) external {
        require(isItemOnMarketplace[_address], "Item not on marketplace");

        // Update the price using the conversion rate
        if (marketplaceItems[itemIndex[_address]].usdConstant) {
            marketplaceItems[itemIndex[_address]].priceMatic = convertUSDToMatic(marketplaceItems[itemIndex[_address]].priceUSD, conversionRate);
        } else {
            marketplaceItems[itemIndex[_address]].priceUSD = convertMaticToUSD(marketplaceItems[itemIndex[_address]].priceMatic, conversionRate);
        }

        CartItem memory newItem = CartItem({
            itemAddress: _address,
            isLock: !_isLock
        });

        cart[msg.sender].push(newItem);
    }


    function removeItemFromCart(address _address) external {
        CartItem[] storage userCart = cart[msg.sender];
        uint256 indexToRemove;
        bool found = false;

        for (uint256 i = 0; i < userCart.length; i++) {
            if (userCart[i].itemAddress == _address) {
                indexToRemove = i;
                found = true;
                break;
            }
        }

        require(found, "Item not found in cart");

        uint256 lastIndex = userCart.length - 1;
        if (indexToRemove != lastIndex) {
            userCart[indexToRemove] = userCart[lastIndex];
        }

        userCart.pop();
    }


    function getCartLength() external view returns (uint256){
        CartItem[] storage userCart = cart[msg.sender];
        return userCart.length;
    }

    function getCartTotal(uint256 conversionRate) external returns (uint256) {
        CartItem[] storage userCart = cart[msg.sender];
        uint256 totalCost = 0;

        for (uint256 i = 0; i < userCart.length; i++) {
            if (userCart[i].isLock) {
                MarketplaceItem storage item = marketplaceItems[itemIndex[userCart[i].itemAddress]];
                if (item.usdConstant) {
                    item.priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
                }
                totalCost += item.priceMatic;
            }
        }

        return totalCost;
    }


    function purchaseCart(uint256 conversionRate) external payable {
        CartItem[] storage userCart = cart[msg.sender];
        uint256 totalCost = 0;

        for (uint256 i = 0; i < userCart.length; i++) {
                if(!isItemOnMarketplace[userCart[i].itemAddress]){
                    continue;
                }
                MarketplaceItem storage item = marketplaceItems[itemIndex[userCart[i].itemAddress]];
                if (item.usdConstant) {
                    item.priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
                }
                totalCost += item.priceMatic;
        }

        require(msg.value >= totalCost, "Insufficient payment for cart items");

        for (uint256 i = 0; i < userCart.length; i++) {
            if(!isItemOnMarketplace[userCart[i].itemAddress]){
                continue;
            }
            purchaseItem(userCart[i].itemAddress, conversionRate);
        }

        delete cart[msg.sender];
    }


    function getUserCart(uint256 conversionRate) external returns (CartItem[] memory) {
        for(uint256 i = 0; i < cart[msg.sender].length; i++){
        if(!isItemOnMarketplace[cart[msg.sender][i].itemAddress]){
            continue;
        }

        MarketplaceItem storage item = marketplaceItems[itemIndex[cart[msg.sender][i].itemAddress]];

        // Update the price using the conversion rate
        if (item.usdConstant) {
            marketplaceItems[itemIndex[cart[msg.sender][i].itemAddress]].priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
        } else {
            marketplaceItems[itemIndex[cart[msg.sender][i].itemAddress]].priceUSD = convertMaticToUSD(item.priceMatic, conversionRate);
        }
        }
        return cart[msg.sender];
    }


    function convertUSDToMatic(uint256 amountUSD, uint256 conversionRate) public pure returns (uint256) {
        // Ensure that the conversion rate is provided in terms of Matic per USD
        return (amountUSD * conversionRate) / 1 ether;
    }


    function convertMaticToUSD(uint256 amountMatic, uint256 conversionRate) public pure returns (uint256) {
        // Ensure that the conversion rate is provided in terms of USD per Matic
        return (amountMatic * 1 ether) / conversionRate;
    }


    function syncLock(address _address) public payable{
        require(isItemOnMarketplace[_address], "Item not on marketplace");

        MarketplaceItem storage item = marketplaceItems[itemIndex[_address]];
        ILockContract lockContract = ILockContract(item.itemAddress);

        marketplaceItems[itemIndex[_address]].name = lockContract.name();
        marketplaceItems[itemIndex[_address]].maxKeys = lockContract.maxNumberOfKeys();
        marketplaceItems[itemIndex[_address]].priceMatic = lockContract.keyPrice();
        marketplaceItems[itemIndex[_address]].expirationDuration = lockContract.expirationDuration();
        marketplaceItems[itemIndex[_address]].tokenUri = lockContract.getGlobalBaseTokenURI();
    }


    function viewItemDetails(address _address, uint256 conversionRate) public returns (MarketplaceItem memory) {
        MarketplaceItem storage item = marketplaceItems[itemIndex[_address]];

        if(item.isLock){
        syncLock(_address);
        }

        if (item.usdConstant) {
            marketplaceItems[itemIndex[_address]].priceMatic = convertUSDToMatic(item.priceUSD, conversionRate);
        } else {
            marketplaceItems[itemIndex[_address]].priceUSD = convertMaticToUSD(item.priceMatic, conversionRate);
        }

        return item;
    }


    //Items by owner
    function viewMyItems(address _owner, uint256 conversionRate) public returns (MarketplaceItem[] memory) {
        MarketplaceItem[] memory ownerItems = itemsByOwner[_owner];
        for (uint256 i = 0; i < ownerItems.length; i++) {
            if(ownerItems[i].isLock){
            syncLock(ownerItems[i].itemAddress);
            }

            if (ownerItems[i].usdConstant) {
                marketplaceItems[itemIndex[ownerItems[i].itemAddress]].priceMatic = convertUSDToMatic(ownerItems[i].priceUSD, conversionRate);
            } else {
                marketplaceItems[itemIndex[ownerItems[i].itemAddress]].priceUSD = convertMaticToUSD(ownerItems[i].priceMatic, conversionRate);
            }
        }

        return ownerItems;
    }


    //Items bought
    function viewMyPurchases()external view returns (MarketplaceItem[] memory) {
        return purchasedItems[msg.sender];
    }



function viewItems(uint256 conversionRate) public returns (MarketplaceItem[] memory) {
    uint256 publicItemCount = 0;

    // First, count how many public items there are
    for (uint256 i = 0; i < marketplaceItems.length; i++) {
        if (!marketplaceItems[i].isPrivate) {
            publicItemCount++;
        }
    }

    // Initialize the publicItems array with the correct size
    MarketplaceItem[] memory publicItems = new MarketplaceItem[](publicItemCount);

    uint256 index = 0;
    for (uint256 i = 0; i < marketplaceItems.length; i++) {
        if (!marketplaceItems[i].isPrivate) {
            if (marketplaceItems[i].isLock) {
                syncLock(marketplaceItems[i].itemAddress);
            }

            if (marketplaceItems[i].usdConstant) {
                marketplaceItems[i].priceMatic = convertUSDToMatic(marketplaceItems[i].priceUSD, conversionRate);
            } else {
                marketplaceItems[i].priceUSD = convertMaticToUSD(marketplaceItems[i].priceMatic, conversionRate);
            }

            publicItems[index] = marketplaceItems[i];
            index++;
        }
    }

    return publicItems;
    }




    function burnKey(address _itemAddress, uint256 _tokenId) external onlyItemOwner(_itemAddress) {
        require(isItemOnMarketplace[_itemAddress], "Item not on marketplace");
        ILockContract(_itemAddress).burn(_tokenId);
    }


    function cancelKey(address _itemAddress, uint256 _tokenId) external {
        require(isItemOnMarketplace[_itemAddress], "Item not on marketplace");
        require(isKeyOwner(_tokenId, msg.sender), "Only key owner can cancel the key");

        ILockContract(_itemAddress).cancelKey(_tokenId);
    }


    function isKeyOwner(uint256 _tokenId, address _owner) internal view returns (bool) {
        uint256[] storage keys = keysByOwner[_owner];
        for (uint256 i = 0; i < keys.length; i++) {
            if (keys[i] == _tokenId) {
                return true;
            }
        }
        return false;
    }
}
