import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import assert from 'assert';
import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { CoveyTownInfo, TownJoinResponse } from '../../classes/TownsServiceClient';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  // initalize state
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [townID, setTownID] = useState<string>('');
  const [rooms, setRooms] = useState<CoveyTownInfo[]>([]);
  const [townName, setTownName] = useState<string>('');
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(true);


  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();
  const { isAuthenticated } = useAuth0();


  // set up hooks for component mount
  useEffect(() => {
    const updateFromApi = async () => {
      // get all the publicly listed towns from the api
      const response = await apiClient.listTowns();

      // sorts by current occupancy decending
      const sorted = response.towns.sort((first, second) => second.currentOccupancy - first.currentOccupancy)

      // update the state accordingly
      setRooms(sorted);
    };
    updateFromApi();
    // call update function every two seconds
    const timer = setInterval(updateFromApi, 2000);
    // clear interval when component unmounts
    return () => clearInterval(timer);
    // dependency; passed in to avoid linter error. useEffect gets called when apiClient changes (but this never happens)
  }, [apiClient]);



  // handle clicks to each public room's 'Connect" button
  const doJoin = async (publicTownID: string) => {
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      if (!publicTownID || publicTownID.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please enter a town ID',
          status: 'error',
        });
        return;
      }
      const initData = await Video.setup(userName, publicTownID);

      const loggedIn = await doLogin(initData);
      if (loggedIn) {
        assert(initData.providerVideoToken);
        await connect(initData.providerVideoToken);
      }
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error',
      });
    }
  };

  const handleJoin = async () => {
    doJoin(townID)
  };



  // handle user click on 'create' button
  const handleCreateTown = async () => {
    try {
      // if townName isn't entered, display error toast
      if (!townName || townName.length === 0) {
        toast({
          title: 'Unable to create town',
          description: 'Please enter a town name',
          status: 'error',
        });
        return;
      }
      // if userName isn't entered, display error toast
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to create town',
          description: 'Please select a username before creating a town',
          status: 'error',
        });
        return;
      }


      const { coveyTownID } = await apiClient.createTown({ friendlyName: townName, isPubliclyListed })
      // if successful, display toast
      toast({
        title: `Town ${townName} is ready to go!`,
        status: 'success',
        duration: null,
        isClosable: true,
      })

      doJoin(coveyTownID);


    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error',
      });
    }
  };



  return (
    <>
      <form>
        <Stack>
          {isAuthenticated ? null : (<Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Select a username
            </Heading>
            <FormControl>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your name'
                value={userName}
                onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
          </Box>)} 
          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Create a New Town
            </Heading>
            <Flex p='4'>
              <Box flex='1'>
                <FormControl>
                  <FormLabel htmlFor='townName'>New Town Name</FormLabel>
                  { }
                  <Input
                    name='townName' placeholder='New Town Name'
                    value={townName}
                    // update the town name with the user's input
                    onChange={event => setTownName(event.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel htmlFor='isPublic'>Publicly Listed</FormLabel>
                  <Checkbox
                    id='isPublic'
                    name='isPublic'
                    // checkbox should be checked by default
                    defaultChecked
                    onChange={() => setIsPubliclyListed(!isPubliclyListed)}
                  />
                </FormControl>
              </Box>
              <Box>
                <Button data-testid='newTownButton' onClick={handleCreateTown}>Create</Button>
              </Box>
            </Flex>
          </Box>
          <Heading p='4' as='h2' size='lg'>
            -or-
          </Heading>

          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Join an Existing Town
            </Heading>
            <Box borderWidth='1px' borderRadius='lg'>
              <Flex p='4'>
                <FormControl>
                  <FormLabel htmlFor='townIDToJoin'>Town ID</FormLabel>
                  <Input
                    name='townIDToJoin'
                    placeholder='ID of town to join, or select from list'
                    value={townID}
                    onChange={event => setTownID(event.target.value)}
                  />
                </FormControl>
                <Button data-testid='joinTownByIDButton' onClick={handleJoin}>
                  Connect
                </Button>
              </Flex>
            </Box>

            <Heading p='4' as='h4' size='md'>
              Select a public town to join
            </Heading>
            <Box maxH='500px' overflowY='scroll'>
              <Table>
                <TableCaption placement='bottom'>Publicly Listed Towns</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Town Name</Th>
                    <Th>Town ID</Th>
                    <Th>Activity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* Returns a list of rows */}
                  {rooms.map((info: CoveyTownInfo) => {
                    const { friendlyName, coveyTownID, currentOccupancy, maximumOccupancy } = info;
                    const isFull = currentOccupancy >= maximumOccupancy;
                    return (
                      <Tr key={coveyTownID}>
                        <Td role='cell'>{friendlyName}</Td>
                        <Td role='cell'>
                          {coveyTownID}
                        </Td>
                        <Td role='cell'>
                          {`${currentOccupancy}/${maximumOccupancy}`}
                          <Button disabled={isFull} onClick={() => doJoin(coveyTownID)}>Connect</Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}
