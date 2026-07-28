"use client";

import {
  FaEye,
  FaEdit,
  FaPrint,
  FaEllipsisH,
} from "react-icons/fa";

interface ReservationActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
  onMore?: () => void;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  color?: string;
  hover?: string;
  onClick?: () => void;
}

function ActionButton({
  icon,
  title,
  color = "text-slate-600",
  hover = "hover:bg-slate-100",
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`
        group
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        border
        border-slate-200
        bg-white
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-md
        ${hover}
        ${color}
      `}
    >
      {icon}
    </button>
  );
}

export default function ReservationActions({
  onView,
  onEdit,
  onPrint,
  onMore,
}: ReservationActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">

      <ActionButton
        title="Ver detalles"
        icon={<FaEye />}
        color="text-blue-600"
        hover="hover:bg-blue-50"
        onClick={onView}
      />

      <ActionButton
        title="Editar reserva"
        icon={<FaEdit />}
        color="text-amber-600"
        hover="hover:bg-amber-50"
        onClick={onEdit}
      />

      <ActionButton
        title="Imprimir contrato"
        icon={<FaPrint />}
        color="text-emerald-600"
        hover="hover:bg-emerald-50"
        onClick={onPrint}
      />

      <ActionButton
        title="Más opciones"
        icon={<FaEllipsisH />}
        color="text-slate-600"
        hover="hover:bg-slate-100"
        onClick={onMore}
      />

    </div>
  );
}