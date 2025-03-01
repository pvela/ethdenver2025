import React, { useState } from 'react';
import { StoryClient, StoryConfig, IpMetadata } from "@story-protocol/core-sdk";
import { Box, Button, TextField, Typography } from '@mui/material';
import { http, useAccount, useConnect } from 'wagmi';
import { Drug } from '../types/Drug';
import SHA256 from 'crypto-js/sha256';
import { injected } from 'wagmi/connectors'
import { uploadJSONToIPFS } from '../services/uploadToIpfs';

// Add these constants at the top of the file
const STORY_RPC_URL = 'https://aeneid.storyrpc.io/';
const SPG_NFT_CONTRACT_ADDRESS = '0x937bef10ba6fb941ed84b8d249abc76031429a9a';
const ROYALTY_POLICY_LAP = '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E';
const WIP_TOKEN_ADDRESS = '0x1514000000000000000000000000000000000000';

export function DrugRegistration({ drug }: { drug: Drug }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [registering, setRegistering] = useState(false);

  const registerDrug = async (drug: Drug) => {
    try {
      console.log('isConnected', isConnected);
      if (!isConnected) {
        console.log('Connecting wallet...');
        await connect({ connector: injected() });
        // Return early to wait for connection state to update
        return;
      }

      console.log('Wallet connected, proceeding with registration...');
      setRegistering(true);
      
      // Initialize Story client
      const config: StoryConfig = {
        account: address as `0x${string}`,
        transport: http(STORY_RPC_URL),
        chainId: "aeneid",
      };

      console.log('Initializing Story client with config:', config);
      const client = StoryClient.newClient(config);

      // Generate IP metadata
      const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: drug.drugName,
        description: `Pharmaceutical drug: ${drug.drugName}`,
        ipType: "pharmaceutical",
        attributes: [
          {
            key: "Description",
            value: drug.description,
          },
          {
            key: "Registration Date",
            value: new Date().toISOString(),
          },
          {
            key: "Code",
            value: drug.productNdc ?? "N/A",
          },
          {
            key: "Manufacturer Name",
            value: drug.manufacturerName ?? "N/A",
          },
          {
            key: "Active Ingredients",
            value: drug.activeIngredients?.join(", ") ?? "N/A",
          },
          {
            key: "Dosage Form",
            value: drug.dosageForm ?? "N/A",
          },
          {
            key: "Strength",
            value: drug.strength ?? "N/A",
          }
        ],
        creators: [
          {
            name: "MedCrypt EthDever 2025",
            contributionPercent: 100,
            address: address as `0x${string}`,
          },
        ],
      });

      const nftMetadata = {
        name:  drug.drugName,
        description: drug.description,
        image: 'https://cdn2.suno.ai/image_large_8bcba6bc-3f60-4921-b148-f32a59086a4c.jpeg',
        attributes: [
            {
                key: 'Source',
                value: 'MedCrypt at ETHDever 2025',
            },
        ],
    }

    // 3. Upload your IP and NFT Metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = SHA256(JSON.stringify(ipMetadata)).toString();
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = SHA256(JSON.stringify(nftMetadata)).toString();

    console.log('ipIpfsHash', ipIpfsHash);
    console.log('ipHash', ipHash);
    console.log('nftIpfsHash', nftIpfsHash);
    console.log('nftHash', nftHash);
    console.dir('ipMetadata', ipMetadata);
    console.dir('nftMetadata', nftMetadata);  

    const response = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: SPG_NFT_CONTRACT_ADDRESS as `0x${string}`,
        allowDuplicates: true,
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
      // Register the drug as an IP Asset with commercial license terms
      /*const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: SPG_NFT_CONTRACT_ADDRESS as `0x${string}`,
        allowDuplicates: false,
        licenseTermsData: [{
          terms: {
            transferable: true,
            royaltyPolicy: ROYALTY_POLICY_LAP as `0x${string}`,
            commercialUse: true,
            commercialRevShare: 5,
            derivativesApproval: false,
            derivativesReciprocal: false,
            uri: "",
            derivativesAllowed: true,
            currency: WIP_TOKEN_ADDRESS as `0x${string}`,
            commercialAttribution: true,
            commercializerChecker: "0x0000000000000000000000000000000000000000",
            commercializerCheckerData: "0x",
            derivativesAttribution: true,
            commercialRevCeiling: BigInt(0),
            defaultMintingFee: BigInt(0),
            expiration: BigInt(0),
            derivativeRevCeiling: BigInt(0)
          },
          licensingConfig: {
            isSet: true,
            licensingHook: "0x0000000000000000000000000000000000000000",
            hookData: "0x",
            commercialRevShare: 5,
            mintingFee: BigInt(0), // Changed from price since price is undefined
            disabled: false,
            expectMinimumGroupRewardShare: "0x0000000000000000000000000000000000000000",
            expectGroupRewardPool: "0x0000000000000000000000000000000000000000"
          }
        }],
        txOptions: { 
          waitForTransaction: true
        }
      });*/

      console.log('Transaction response:', response);
      return response.ipId;

    } catch (error) {
      console.error('Failed to register drug:', error);
      throw error;
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Box>
      <Button 
        variant="contained"
        onClick={() => registerDrug(drug)}
        disabled={registering}
      >
        {registering ? 'Registering...' : isConnected ? 'Register as IP Asset' : 'Connect Wallet to Register'}
      </Button>
    </Box>
  );
} 