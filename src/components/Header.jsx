"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn, useSession, signOut } from "next-auth/react";
import Modal from "react-modal";
import { useState, useRef, useEffect } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { HiCamera } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { app } from "../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

export default function Header() {
  const filePickerRef = useRef(null);
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [postUploading, setPostUploading] = useState(false);
  const db = getFirestore(app);
  const [caption, setCaption] = useState("");
  const addImageToPost = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(e.target.files[0]);
      setImageFileUrl(URL.createObjectURL(file));
      console.log(selectedFile);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      uploadImageToStorage();
    }
  }, [selectedFile]);
  async function uploadImageToStorage() {
    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + "-" + selectedFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error(error);
        setImageFileUploading(false);
        setImageFileUrl(null);
        setSelectedFile(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setImageFileUploading(false);
        });
      }
    );
  }
  async function handleSubmit() {
    setPostUploading(true);
    const docRef = await addDoc(collection(db, "posts"), {
      username: session.user.username,
      caption,
      profileImg: session.user.image,
      image: imageFileUrl,
      timestamp: serverTimestamp(),
    });
    setPostUploading(false);
    setIsOpen(false);
  }
  console.log(session);
  return (
    <div className="shadow-sm border-b sticky top-0 bg-white z-30 p-3">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/*Logo */}
        <Link href="/" className="hidden lg:inline-flex">
          <Image
            src="/Instagram_logo_black.webp"
            width={96}
            height={96}
            alt="logo"
          />
        </Link>
        <Link href="/" className="lg:hidden ">
          <Image
            src="/800px-Instagram_logo_2016.webp"
            width={40}
            height={40}
            alt="logo"
          />
        </Link>
        {/*search  */}
        <input
          type="text"
          placeholder="Поиск"
          className="bg-gray-50 border border-gray-200 rounded text-sm w-full py-2 px-4 max-w-[210px]"
        ></input>
        {/*menu  */}
        {session ? (
          <div className="flex gap-2 items-center">
            <IoIosAddCircleOutline
              className="text-2xl cursor-pointer transform hover:scale-125 transition duration-300 hover:text-red-600"
              onClick={() => setIsOpen(true)}
            />
            <img
              src={session.user.image}
              alt="profile"
              className="cursor-pointer h-10 w-10 rounded-full"
              onClick={signOut}
            />
          </div>
        ) : (
          <button
            onClick={signIn}
            className="text-sm font-semibold text-blue-500 cursor-pointer"
          >
            Войти
          </button>
        )}
      </div>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          className="max-w-lg w-[90%] p-6 absolute top-56 left-[50%] translate-x-[-50%] bg-white border-2 rounded-md shadow-md"
          onRequestClose={() => setIsOpen(false)}
          ariaHideApp={false}
        >
          <div className="flex flex-col justify-center items-center h-[100%]">
            {selectedFile ? (
              <img
                src={imageFileUrl}
                alt="selected gile"
                className={`w-full max-h-[250px] object-cover cursor-pointer ${
                  imageFileUploading ? "animate-pulse" : ""
                }`}
                onClick={() => setSelectedFile(null)}
              />
            ) : (
              <HiCamera
                className="text-5xl text-gray-400 cursor-pointer"
                onClick={() => filePickerRef.current.click()}
              />
            )}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={addImageToPost}
              ref={filePickerRef}
            />
          </div>
          <input
            type="text"
            placeholder="Введите описание"
            maxLength={300}
            className="m-4 border-none text-center w-full focus:ring-0 outline-none"
            onChange={(e) => setCaption(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={
              !selectedFile ||
              !caption.trim() === "" ||
              postUploading ||
              imageFileUploading
            }
            className="w-full bg-red-600 text-white p-2 shadow-md rounded-lg hover:brightness-105 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:hover:brightness-100"
          >
            Загрузить пост
          </button>
          <AiOutlineClose
            className="cursor-pointer absolute top-1 right-1 text-2xl hover:text-red-500 transition duration-400"
            onClick={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
