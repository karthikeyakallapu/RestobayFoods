import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import useModalStore from "../../store/use-modal";
import Cart from "../Cart/Cart";
import Table from "../Table/Table";
import AddNewItem from "../Admin/AddNewItem";
import EditItem from "../Admin/EditItem";

const MODAL_COMPONENTS = {
  cart: Cart,
  table: Table,
  additem: AddNewItem,
  edititem: EditItem,
};

function Modal() {
  const { isOpen, component, closeModal, setModalRef } = useModalStore();
  const localRef = useRef(null);

  useEffect(() => {
    if (localRef.current) {
      setModalRef(localRef.current);
    }
  }, [localRef, setModalRef]);

  useEffect(() => {
    if (!isOpen || !localRef.current) return;

    const handleClickOutside = (event) => {
      if (localRef.current && !localRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeModal]);

  if (!isOpen || !component) return null;

  const ComponentToRender = MODAL_COMPONENTS[component];

  return (
    <motion.div
      className="z-50 fixed inset-0 overflow-y-auto flex justify-center items-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="z-50  flex items-center justify-center">
        <motion.div
          className=" relative rounded-md   "
          ref={localRef}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col ">
            <div className="flex items-center justify-end mb-4"></div>
            <ComponentToRender />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Modal;
