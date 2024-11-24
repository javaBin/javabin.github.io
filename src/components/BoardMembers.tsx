import Image from "next/image"
import { BoardMemberType } from "../data/boardmembers"
import { useTranslation } from "next-i18next"

const BoardMember = (props: BoardMemberType) => {
  const { t } = useTranslation("common", { keyPrefix: "boardMember" })

  return (
    <div className="board-member">
      <Image
        src={`/img/styret/${props.img}`}
        className="img-circle"
        height={150}
        width={150}
        alt={props.name}
      />
      <h4>{props.name}</h4>
      <p className="text-muted">{t(props.title)}</p>
    </div>
  )
}

type Props = {
  boardMembers: BoardMemberType[];
};

const BoardMembers = (props: Props) => {
  const { t } = useTranslation("common", { keyPrefix: "main" });

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 text-center">
          <h1 className="section-heading">{t("theBoard")}</h1>
        </div>
      </div>
      <div className="board-members">
        {props.boardMembers.map((boardMember) => (
          <BoardMember key={boardMember.name} {...boardMember} />
        ))}
      </div>
    </div>
  );
};

export default BoardMembers;
