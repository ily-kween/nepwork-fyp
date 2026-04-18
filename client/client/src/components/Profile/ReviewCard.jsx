import React from "react";

function Review() {
    return (
        <>
            <div className="bg-whitetext shadow-[1px_1px_10.3px_0px_rgba(0,0,0,0.25)] w-[350px] h-[280px] rounded-md flex flex-col">
                <div className="p-4 flex flex-col h-full">
                    <div className="flex gap-4 items-center">
                        <div>
                            <img 
                                className="w-[60px] h-[60px] rounded-full" 
                                src="assets/image.png" 
                                alt="Profile Picture" 
                            />
                        </div>
                        <div className="font-semibold">Jane Cooper</div>
                    </div>
                    <div className="mt-4 flex-1 overflow-y-auto">
                        Manish is the graestst tam oin the owqtle a daw awdwadawa aw rafa wfaw awf awwafda wfwa awfwa f aw waf.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris...
                        Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
                        deserunt mollit anim id est laborum.
                    </div>
                </div>
            </div>
        </>
    );
}

export default Review;