type Button = {
    label: string;
    action?: () => void;
    danger?: boolean;
}

export default function ChoicePopup({ title, left, right, onClose }:
    { title: string, left: Button, right: Button, onClose: () => void }) {
    return (
        <div className="fixed w-screen h-screen flex bg-black/75" onClick={onClose}>
            <div className="bg-list m-auto rounded items-center flex flex-col" onClick={(e) => e.stopPropagation()}>
                <p className="text-2xl p-4">{title}</p>
                <div className="flex flex-row mt-8 m-4 gap-8">
                    <button
                        className={`p-2 rounded ${left.danger ? 'hover:bg-danger' : 'hover:bg-button-hover'}`}
                        onClick={left.action}
                    >{left.label}</button>
                    <button
                        className={`ml-auto p-2 rounded ${right.danger ? 'hover:bg-danger' : 'hover:bg-button-hover'}`}
                        onClick={right.action}
                    >{right.label}</button>
                </div>
            </div>
        </div>
    )
}