
import React, { useState, useEffect } from 'react'
import { TextField, Button, Text } from '@gnosis.pm/safe-react-components';
import { useSafe } from '@rmeissner/safe-apps-react-sdk';
import './App.css';
import WalletConnect from "@walletconnect/client";


const LOCAL_STORAGE_URI_KEY = 'safeAppWcUri'

const App = () => {
  const [connector, setConnector] = useState<WalletConnect|undefined>(undefined)

  const safe = useSafe()
  const [wcUri, setWcUri] = useState('');

  const wcConnect = React.useCallback(async (uri) => {
    // Create Connector
    const connector = new WalletConnect(
      {
        uri,
        clientMeta: {
          description: "Gnosis Safe",
          url: "https://gnosis-safe.io/app",
          icons: ["https://walletconnect.org/walletconnect-logo.png"],
          name: "Gnosis Safe",
        },
      });

      // Subscribe to session requests
      connector.on("session_request", (error, payload) => {
        console.log({payload})
        if (error) {
          throw error;
        }
        
        // Auto-Approve Session
        connector.approveSession({
          accounts: [
            safe.getSafeInfo().safeAddress
          ],
          chainId: safe.getSafeInfo().network === "rinkeby" ? 4 : 1
        })
      });

      // Subscribe to call requests
      connector.on("call_request", (error, payload) => {
        console.log({payload})
        if (error) {
          throw error;
        }
        
        if (payload.method === "eth_sendTransaction") {
          const txInfo = payload.params[0]
          safe.sendTransactions([
            {
              to: txInfo.to,
              value: txInfo.value || "0x0",
              data: txInfo.data || "0x"
            }
          ])
        }

      });
      
      connector.on("disconnect", (error, payload) => {
        if (error) {
          throw error;
        }
        wcDisconnect();
      });

      console.log({connector})
      setConnector(connector);
      localStorage.setItem(LOCAL_STORAGE_URI_KEY, uri);
  }, [safe])

  const wcDisconnect = React.useCallback(async () => {
    connector?.killSession();
    localStorage.removeItem(LOCAL_STORAGE_URI_KEY);
    setConnector(undefined);
  }, [connector])

  useEffect(() => {
    const uri = localStorage.getItem(LOCAL_STORAGE_URI_KEY);

    if (uri) wcConnect(uri);
  }, [wcConnect])

  return (
    <>

      {(connector === undefined) ? (
        <>
        <TextField
          id="wc-uri"
          label="WalletConnect URI"
          value={wcUri}
          onChange={(e) => setWcUri(e.target.value)}
        />    
        <div>
          <Button 
            size="md" 
            color="primary" 
            variant="contained" 
            onClick={() => wcConnect(wcUri) }>
            Connect
          </Button>
        </div>
        </>
      ) : (
        <>
          <Text size="lg">Bridge: { connector.bridge }</Text>
          <Text size="lg">Dapp name: { connector.peerMeta?.name }</Text>
          <Text size="lg">Dapp url: { connector.peerMeta?.url }</Text>
          <div>
            <Button 
              size="md" 
              color="primary" 
              variant="contained" 
              onClick={() => wcDisconnect() }>
              Disconnect
            </Button>
          </div>
        </>
        )
      }
      
    </>
  )
}

export default App
