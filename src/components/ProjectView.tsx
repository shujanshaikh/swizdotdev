import { useParams } from "react-router-dom";

export default function ProjectView() {
    const { id } = useParams()
    console.log(id)
  return (
    <div>
      <h1>Project View {id}</h1>
    </div>
  )
}