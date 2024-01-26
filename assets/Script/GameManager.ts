import { _decorator, CCInteger, Component, instantiate, Node, Prefab, Label, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
};

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Prefab })
    public boxPrefab: Prefab | null = null;
    @property({ type: CCInteger })
    public roadLength: number = 50;
    private _road: BlockType[] = [];

    @property({ type: Node })
    public startMenu: Node | null = null; // 开始的 UI
    @property({ type: Node })
    public endMenu: Node | null = null; // 結束的 UI
    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null; // 角色控制器
    @property({ type: Label })
    public stepsLabel: Label | null = null; // 计步器
    @property({ type: Label })
    public endMenuLabel: Label | null = null; // 結算步數及時間
    @property({ type: Label })
    public timeLabel: Label | null = null; // 计時器

    // init() {

    // }


    start() {
        //     this.generateRoad()
        this.setCurState(GameState.GS_INIT);
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    onStartButtonClicked() {
        this.setCurState(GameState.GS_PLAYING);
    }

    onRePlayButtonClicked() {
        this.setCurState(GameState.GS_INIT);
    }

    update(deltaTime: number) {
        this.timeLabel.string = /[0-9]*\.?.?.?/.exec(
            (
                (!Number.isNaN(parseFloat(this.timeLabel.string)) ? parseFloat(this.timeLabel.string) : 0)
                + deltaTime
            ).toString()
        )[0] // 更新時間
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = (parseInt(this.stepsLabel.string) + 1).toString();
        }
        this.checkResult(moveIndex);
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {   //跳到了空方块上

                this.setCurState(GameState.GS_END)
            }
        } else {    // 跳过了最大长度            
            this.setCurState(GameState.GS_INIT);
        }
    }

    setCurState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                if (this.endMenu) {
                    this.endMenu.active = false;
                }
                if (this.startMenu) {
                    this.startMenu.active = true;
                }

                if (this.timeLabel) {
                    this.timeLabel.node.active = false;
                }

                this.generateRoad();

                if (this.playerCtrl) {
                    this.playerCtrl.setInputActive(false);
                    this.playerCtrl.node.setPosition(Vec3.ZERO);
                    this.playerCtrl.reset();
                }
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }

                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';   // 将步数重置为0
                }

                if (this.timeLabel) {
                    this.timeLabel.node.active = true;
                    this.timeLabel.string = '0';
                }

                setTimeout(() => {      //直接设置active会直接开始监听鼠标事件，做了一下延迟处理
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                if (this.endMenu) {
                    this.endMenuLabel.string = "You Jump " + this.stepsLabel.string + " Time\nIn " + this.timeLabel.string + ' Second'
                    this.endMenu.active = true;
                    this.stepsLabel.string = ''
                }
                if (this.playerCtrl) {
                    this.playerCtrl.setInputActive(false);
                    this.playerCtrl.node.setPosition(Vec3.ZERO);
                    this.playerCtrl.reset();
                }

                if (this.timeLabel) {
                    this.timeLabel.node.active = false;
                }
                break;
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }

        return block;
    }

    generateRoad() {

        this.node.removeAllChildren();

        this._road = [];
        // startPos
        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, -40, 0);
            }
        }
    }
}


