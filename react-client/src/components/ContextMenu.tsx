import { useState, cloneElement, useEffect, useRef } from "react";

export type Action = {
    name: string;
    action: () => void;
    danger?: boolean;
    submenu?: Action[];
    icon?: JSX.Element;
}

export default function ContextMenu({ actions, children }: { actions: Action[], children: JSX.Element }) {
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [visible, setVisible] = useState(false);
    const menuRef = useRef(null);
    const containerRef = useRef(null);

    function handleOpen(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        event.preventDefault();
        setMenuPosition({ x: event.pageX, y: event.pageY });
        setVisible(true);
    }

    const handleContextMenu = (e) => {
        if (containerRef.current && containerRef.current.contains(e.target)) {
            e.preventDefault();
            setMenuPosition({ x: e.pageX, y: e.pageY });
            setVisible(true);
        } else {
            setVisible(false);
        }
    };

    const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div ref={containerRef}>
            {visible && (
                <div
                    className="absolute shadow-2xl bg-context-menu border-context-menu-border border-2 flex flex-col rounded"
                    style={{ left: menuPosition.x, top: menuPosition.y }}
                    ref={menuRef}
                >
                    {actions.map((action) => {
                        const sizedIcon = cloneElement(action.icon, { size: 20 });
                        const color = action.danger ? "hover:bg-danger" : "hover:bg-button-hover"
                        return (
                            <div
                                className={`flex flex-row cursor-pointer z-10 items-center gap-2 p-1 first:rounded-t last:rounded-b ${color}`}
                                onClick={() => {
                                    setVisible(false);
                                    action.action();
                                }}
                            >
                                {sizedIcon}
                                <p>{action.name}</p>
                            </div>
                        )
                    })}
                </div >
            )}
            <div>
                {children}
            </div>
        </div >
    );
}