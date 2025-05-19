import { Button } from "@chakra-ui/react"; // Import Button from Chakra UI
import { AddIcon } from "@chakra-ui/icons"; // Import AddIcon from Chakra UI

export default function Component({ onOpen }) {
  return (
    <div className="flex h-screen">
      {/* Left column */}
      <div className="w-20 bg-purple-500 flex flex-col items-center justify-center relative">
        <div className="relative w-full flex justify-center">
          <div className="relative w-3/4 h-20 bg-teal-500 rounded-l-full"></div>
          <Button
            size="lg"
            variant="outline"
            borderRadius="full"
            bg="white"
            borderColor="purple.500"
            borderWidth="6px"
            position="absolute"
            top="50%"
            transform="translateY(-50%)"
            width="70px"
            height="70px"
            onClick={onOpen}
          >
            <AddIcon boxSize={5} color="black" />
          </Button>
        </div>
      </div>
    </div>
  );
}
