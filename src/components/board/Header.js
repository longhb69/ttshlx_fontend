import Button from '@atlaskit/button/new';

export default function Header() {
    return (
        <div className="bg-[#0000003d] backdrop-blur-sm h-auto relative">
            <div className="inline-flex relative wrap items-center w-[calc(100%-23px)] h-auto py-[12px] pl-[18px] pr-[12px] gap-[4px]" 
                style={{ width: 'calc(100% - 23px)' }}
            >
                <span className="flex relative nowrap items-start max-w-full min-h-[32px] gap-2">
                    <Button appearance="primary">C</Button>
                    <Button appearance="primary">B1+B2</Button>
                    <Button appearance="primary">B11</Button>
                </span>
            </div>
        </div>
    )
}