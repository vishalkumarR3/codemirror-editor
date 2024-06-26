import React, { useEffect, useState } from "react";
import img from "../../assets/landing_img.png"
import { useUserContext } from "../../context/user/UserContext"
import toast from "react-hot-toast"
import RoomCard from "./RoomCard";
import { useRoomContext } from "../../context/room/RoomContext";
import { useNavigate } from "react-router-dom"

const JoinRoom = () => {

  const { userData } = useUserContext()
  const [rooms, setRooms] = useState(null)
  const [roomInfo, setRoomInfo] = useState({
    rooName: "",
    password: ""
  })
  const { setRoomData, setEditorData, clearRoomStuff, boardData } = useRoomContext()
  const navigate = useNavigate()

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/room/get?username=${userData.username}`)
      const data = await response.json()
      console.log(data)
      if (data.success) {
        return setRooms(data.data.value)
      } else if (data.data.statusCode === 404) {
        setRooms(null)
      }
    } catch (error) {
      console.log(error)
      toast.error("server error")
    }
  }

  const handleCreateOrJoin = async (e, callType) => {
    e.preventDefault()
    if (!roomInfo.password || !roomInfo.rooName) {
      return toast.error("please enter complete information")
    }
    let toastId
    try {
      toastId = toast.loading(`${callType === "create" ? "Creating room" : "Joining room"}`)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/room/${callType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        mode: "cors",
        body: callType === "create" ? JSON.stringify({
          name: roomInfo.rooName,
          password: roomInfo.password,
          users: [userData.username],
          admin: userData.username
        }) : JSON.stringify({
          name: roomInfo.rooName,
          password: roomInfo.password,
          username: userData.username,
        })
      })
      const data = await response.json()
      console.log(data)
      if (data.success) {
        if (data.data.statusCode === 201) {
          setRoomData(data.data.value)
          const codeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/code/create`, {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "html": "",
              "css": "",
              "js": "",
              "roomId": data.data.value._id
            })
          })
          const codeData = await codeResponse.json()
          if (codeData.success) {
            console.log(codeData.data.value._id)
            setEditorData((pre) => ({ ...pre, _id: codeData.data.value._id }))
          }
          const boardResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/board/create`, {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "content": "",
              "roomId": data.data.value._id
            })
          })
          const boardData = await boardResponse.json()
          if (boardData.success) {
            console.log(boardData.data.data._id)
            boardData.current = { content: "", _id: boardData.data.data._id }
          }

          toast.success("Room created successfully", {
            id: toastId
          })

          return navigate(`/room/${data.data.value._id}`)
        } else if (data.data.statusCode === 200) {
          // fetchData(data.data.value._id)
          setRoomData(data.data.value)
          toast.success("Joined room", {
            id: toastId
          })
          return navigate(`/room/${data.data.value._id}`)
        }
      }
      if (data.data.statusCode === 403 || data.data.statusCode === 401 || data.data.statusCode === 404 || data.data.statusCode === 400) {
        toast.error(data.data.message, {
          id: toastId
        })
      }
      if (data.data.statusCode === 422) {
        console.log(data.data.value)
        let value = data.data.value
        if (value[0]["name"]) {
          toast.error(value[0]["name"], {
            id: toastId
          })
        } else if (value[0]["users"]) {
          toast.error(value[0]["users"], {
            id: toastId
          })
        } else if (value[0]["password"]) {
          toast.error(value[0]["password"], {
            id: toastId
          })
        } else if (value[0]["admin"]) {
          toast.error(value[0]["admin"], {
            id: toastId
          })
        } else if (value[0]["username"]) {
          toast.error(value[0]["username"], {
            id: toastId
          })
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    clearRoomStuff()
    fetchRooms()
  }, [])

  return (

    <div className="h-screen w-screen px-10 flex gap-8 items-center  bg-gradient-to-r from-purple-500 to-pink-300">
      <div className="w-[30%] h-2/3  bg-rose-100 rounded-2xl flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold tracking-tighter ">Rooms</h1>
        <div className="mt-4 w-full h-full overflow-y-auto flex flex-col gap-4">
          {
            rooms && rooms.map((el) => (
              <RoomCard key={el._id} roomName={el.name} _id={el._id} rooms={rooms} />
            )
            )
          }
        </div>
      </div>


      <div className="w-96 h-2/3 bg-rose-100 rounded-2xl flex flex-col items-center justify-evenly">
        <h1 className="text-2xl font-bold tracking-tighter">
          CodeHub
        </h1>



        <form action="" className="flex flex-col gap-y-4">
          <input type="text" placeholder="room name" className="p-3 rounded-xl" value={roomInfo.rooName} onChange={(e) => setRoomInfo((pre) => ({ ...pre, rooName: e.target.value }))} />
          <input type="password" placeholder="password" className="p-3 rounded-xl" value={roomInfo.password} onChange={(e) => setRoomInfo(pre => ({ ...pre, password: e.target.value }))} />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white mt-4 rounded-full p-4"
            onClick={(e) => handleCreateOrJoin(e, "create")}
          >
            Create Room
          </button>
          <div class="relative flex items-center">
            <div class="flex-grow border-t border-gray-400"></div>
            <span class="flex-shrink mx-4 text-gray-400">OR</span>
            <div class="flex-grow border-t border-gray-400"></div>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4"
            onClick={(e) => handleCreateOrJoin(e, "join")}
          >
            Join Room
          </button>

        </form>
      </div>
      <div>
        <img src={img} alt="" srcset="" />
      </div>
    </div>
  );
};

export default JoinRoom;
