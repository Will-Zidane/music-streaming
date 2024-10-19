import MyImage from "./MyImage";

const LeftSideBar = () => {
  return (
    <header >
      <MyImage src={"/music-streaming-icon.webp"} width={60} height={60} priority quality={100}/>
    </header>
  );
};

export default LeftSideBar;
