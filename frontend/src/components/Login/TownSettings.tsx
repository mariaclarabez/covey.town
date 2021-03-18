import React, { useState } from 'react';

import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import useCoveyAppState from '../../hooks/useCoveyAppState';

const TownSettings: React.FunctionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { apiClient, currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed } = useCoveyAppState();
  // set states
  const [friendlyName, setFriendlyName] = useState<string>(currentTownFriendlyName);
  const [isPubliclyListed, setIsPubliclyListed] = useState<boolean>(currentTownIsPubliclyListed);
  const [password, setPassword] = useState<string>('');


  const toast = useToast()

  // handle user click on update town button
  const processUpdates = async () => {
    try {
      await apiClient.updateTown({ coveyTownID: currentTownID, friendlyName, isPubliclyListed, coveyTownPassword: password })
      // upon success, display following toast
      toast({
        title: 'Town updated',
        status: 'success',
        description: 'To see the updated town, please exit and re-join this town',
      })
      onClose();

    } catch (err) {
      // upon failure, display an error toast
      toast({
        title: 'Unable to update town',
        status: 'error',
        description: err.toString(),
      })
    }
  };

  // handle user click on delete button
  const handleDelete = async () => {
    try {
      await apiClient.deleteTown({ coveyTownID: currentTownID, coveyTownPassword: password })
      toast({
        title: 'Town deleted',
        status: 'success',
      })
      onClose()

    } catch (err) {

      toast({
        title: 'Unable to delete town',
        status: 'error',
        description: err.toString(),
      })
    }
  };

  return <>
    <MenuItem data-testid='openMenuButton' onClick={onOpen}>
      <Typography variant="body1">Town Settings</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit town {currentTownFriendlyName} ({currentTownID})</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={(ev) => {
          ev.preventDefault();
          processUpdates();
        }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='friendlyName'>Friendly Name</FormLabel>
              <Input
                id='friendlyName'
                placeholder="Friendly Name"
                name="friendlyName"
                value={friendlyName}
                // change the friendly name to whatever the user inputs
                onChange={event => setFriendlyName(event.target.value)}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor='isPubliclyListed'>Publicly Listed</FormLabel>
              <Checkbox
                defaultChecked={currentTownIsPubliclyListed}
                id="isPubliclyListed"
                name="isPubliclyListed"
                onChange={() => setIsPubliclyListed(!currentTownIsPubliclyListed)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
              <Input
                data-testid="updatePassword"
                id="updatePassword"
                placeholder="Password"
                name="password"
                type="password"
                value={password}
                onChange={event => setPassword(event?.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              data-testid='deletebutton'
              colorScheme="red"
              mr={3}
              onClick={() => handleDelete()}
              value="delete">
              Delete
              </Button>
            <Button data-testid='updatebutton' colorScheme="blue" type="submit" mr={3}
              onClick={() => processUpdates()}
              value="update">
              Update
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  </>
}

export default TownSettings;
